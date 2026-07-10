import { useEffect, useMemo, useRef, useState } from 'react'
import { searchPhrases, segmentSentence, type SentenceSegment } from '../services/dictionarySearch'
import { isSpeechInputSupported, startSpeechInput, type SpeechInputController } from '../services/speechInput'
import { translateOnline, OnlineTranslateError, type OnlineTranslationResult } from '../services/onlineTranslate'
import { speakThai, isTtsSupported } from '../services/ttsPlayer'
import { PhraseDisplay } from '../components/PhraseDisplay'
import type { Phrase } from '../domain/types'
import { useSettings } from '../hooks/useSettings'

const ONLINE_ERROR_MESSAGES: Record<string, string> = {
  offline: 'Нет подключения к интернету — онлайн-перевод недоступен.',
  network: 'Не удалось связаться с сервисом перевода. Проверьте соединение и попробуйте снова.',
  quota: 'Превышен дневной лимит бесплатных онлайн-переводов. Попробуйте позже.',
  empty: 'Сервис не вернул перевод для этой фразы.',
}

type SegmentGroup = { type: 'phrase'; phrase: Phrase } | { type: 'unknown'; words: string[] }

function groupSegments(segments: SentenceSegment[]): SegmentGroup[] {
  const groups: SegmentGroup[] = []
  for (const seg of segments) {
    if (seg.type === 'unknown') {
      const last = groups[groups.length - 1]
      if (last?.type === 'unknown') last.words.push(seg.text)
      else groups.push({ type: 'unknown', words: [seg.text] })
    } else {
      groups.push({ type: 'phrase', phrase: seg.phrase })
    }
  }
  return groups
}

export function TranslateScreen() {
  const [query, setQuery] = useState('')
  const lang = useSettings((s) => s.translateSourceLang)
  const setLang = useSettings((s) => s.setTranslateSourceLang)

  const [listening, setListening] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const controllerRef = useRef<SpeechInputController | null>(null)
  const speechSupported = useMemo(() => isSpeechInputSupported(), [])

  useEffect(() => () => controllerRef.current?.stop(), [])

  function toggleListening() {
    if (listening) {
      controllerRef.current?.stop()
      return
    }
    setSpeechError(null)
    setListening(true)
    const controller = startSpeechInput(
      lang,
      (transcript) => setQuery(transcript),
      () => setListening(false),
      (kind) => {
        setListening(false)
        setSpeechError(
          kind === 'permission'
            ? 'Нет доступа к микрофону. Разрешите доступ в настройках браузера.'
            : kind === 'no-speech'
              ? 'Речь не распознана, попробуйте ещё раз.'
              : kind === 'unsupported'
                ? 'Голосовой ввод не поддерживается в этом браузере.'
                : 'Не удалось распознать речь.',
        )
      },
    )
    controllerRef.current = controller
  }

  // Короткие запросы (до 3 слов) ищем как единую фразу — с допуском на опечатки
  // и частичные совпадения. Более длинные предложения сразу разбиваем на
  // фрагменты, чтобы не терять слова, не вошедшие ни в одну известную фразу.
  const wordCount = query.trim() ? query.trim().split(/\s+/).length : 0
  const results = useMemo(() => (wordCount > 3 ? [] : searchPhrases(query, lang)), [query, lang, wordCount])
  const segments = useMemo(
    () => (results.length === 0 && query.trim() ? segmentSentence(query, lang) : []),
    [results, query, lang],
  )
  // соседние нераспознанные слова группируем в одно сообщение
  const groupedSegments = useMemo(() => groupSegments(segments), [segments])

  const [onlineResult, setOnlineResult] = useState<OnlineTranslationResult | null>(null)
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)

  useEffect(() => {
    setOnlineResult(null)
    setOnlineError(null)
  }, [query, lang])

  async function handleOnlineTranslate() {
    setOnlineLoading(true)
    setOnlineError(null)
    try {
      const result = await translateOnline(query, lang)
      setOnlineResult(result)
    } catch (err) {
      const kind = err instanceof OnlineTranslateError ? err.kind : 'network'
      setOnlineError(ONLINE_ERROR_MESSAGES[kind])
    } finally {
      setOnlineLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <div className="flex gap-2">
        {(['ru', 'fr'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              lang === l ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {l === 'ru' ? 'Русский' : 'Français'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'ru' ? 'Введите или скажите фразу…' : 'Écrivez ou dites une phrase…'}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          autoFocus
        />
        {speechSupported && (
          <button
            onClick={toggleListening}
            aria-label={listening ? 'Остановить запись' : 'Голосовой ввод'}
            className={`shrink-0 rounded-xl px-4 py-3 text-lg active:scale-95 ${
              listening ? 'animate-pulse bg-red-500 text-red-950' : 'bg-slate-800 text-slate-200'
            }`}
          >
            🎙️
          </button>
        )}
      </div>

      {listening && <p className="text-xs text-emerald-400">Слушаю…</p>}
      {speechError && <p className="rounded-lg bg-red-950 px-3 py-2 text-xs text-red-300">{speechError}</p>}

      <p className="text-xs text-slate-500">
        Сначала поиск идёт по локальному куррированному разговорнику (офлайн, с проверенной тональной разметкой).
        Если точной фразы нет, приложение подсветит известные фрагменты, а остальное можно перевести через интернет.
      </p>

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.phrase.id}>
            <PhraseDisplay phrase={r.phrase} />
            {r.matchType !== 'exact' && (
              <p className="mt-1 text-[11px] text-slate-500">
                {r.matchType === 'substring' ? 'Частичное совпадение' : 'Похожее совпадение'}
              </p>
            )}
          </div>
        ))}
      </div>

      {groupedSegments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Точной фразы нет, вот перевод по найденным фрагментам:</p>
          {groupedSegments.map((g, i) =>
            g.type === 'phrase' ? (
              <PhraseDisplay key={i} phrase={g.phrase} />
            ) : (
              <p key={i} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500">
                «{g.words.join(' ')}» — нет в словаре
              </p>
            ),
          )}
        </div>
      )}

      {results.length === 0 && query.trim() && (
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <button
            onClick={handleOnlineTranslate}
            disabled={onlineLoading}
            className="w-full rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-sky-950 disabled:opacity-60"
          >
            {onlineLoading ? 'Переводим…' : '🌐 Перевести всю фразу через интернет'}
          </button>

          {onlineError && <p className="rounded-lg bg-red-950 px-3 py-2 text-xs text-red-300">{onlineError}</p>}

          {onlineResult && (
            <div className="rounded-xl border border-sky-900 bg-sky-950/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="thai-script text-2xl text-slate-100">{onlineResult.thai}</p>
                {isTtsSupported() && (
                  <button
                    onClick={() => speakThai(onlineResult.thai)}
                    aria-label="Прослушать произношение"
                    className="shrink-0 rounded-full bg-slate-800 p-2.5 text-lg hover:bg-slate-700 active:scale-95"
                  >
                    🔊
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs text-sky-300">
                Онлайн-перевод (сервис MyMemory). Кириллическая транскрипция и тоны для этой фразы не проверены —
                ориентируйтесь на озвучку и, по возможности, сверьте с носителем языка.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
