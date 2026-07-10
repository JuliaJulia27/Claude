import { useEffect, useMemo, useRef, useState } from 'react'
import { searchPhrases } from '../services/dictionarySearch'
import { isSpeechInputSupported, startSpeechInput, type SpeechInputController } from '../services/speechInput'
import { translateOnline, OnlineTranslateError } from '../services/onlineTranslate'
import { readThai } from '../services/thaiReading'
import { PhraseDisplay } from '../components/PhraseDisplay'
import type { Phrase } from '../domain/types'
import { useSettings } from '../hooks/useSettings'

const ONLINE_ERROR_MESSAGES: Record<string, string> = {
  offline: 'Нет подключения к интернету — перевод произвольных фраз недоступен, но разговорник и уроки работают офлайн.',
  network: 'Не удалось связаться с сервисом перевода. Проверьте соединение и попробуйте снова.',
  quota: 'Превышен дневной лимит бесплатных переводов. Попробуйте позже.',
  empty: 'Сервис не вернул перевод для этой фразы.',
}

// Локальную куррированную фразу считаем достаточно надёжной, чтобы не ходить
// в сеть, если совпадение точное или очень близкое (например, опечатка).
const LOCAL_MATCH_THRESHOLD = 0.85
const DEBOUNCE_MS = 500

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

  // 1) Сначала — локальный куррированный словарь (офлайн, тон проверен вручную).
  const localMatch = useMemo(() => {
    const hits = searchPhrases(query, lang, 1)
    const hit = hits[0]
    if (hit && hit.score >= LOCAL_MATCH_THRESHOLD) return hit.phrase
    return null
  }, [query, lang])

  // 2) Если локального совпадения нет — автоматически переводим через интернет
  // и сами строим тональную транскрипцию по правилам тайской орфографии.
  const [autoPhrase, setAutoPhrase] = useState<Phrase | null>(null)
  const [autoLoading, setAutoLoading] = useState(false)
  const [autoError, setAutoError] = useState<string | null>(null)
  const [autoErrorDetail, setAutoErrorDetail] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    setAutoPhrase(null)
    setAutoError(null)
    setAutoErrorDetail(null)

    if (localMatch || !query.trim()) {
      setAutoLoading(false)
      return
    }

    const myRequestId = ++requestIdRef.current
    setAutoLoading(true)
    const timer = setTimeout(async () => {
      try {
        const result = await translateOnline(query, lang)
        if (requestIdRef.current !== myRequestId) return // запрос устарел (пользователь печатает дальше)
        const syllables = readThai(result.thai)
        setAutoPhrase({
          id: 'auto',
          category: 'basics',
          ru: lang === 'ru' ? query : '',
          fr: lang === 'fr' ? query : '',
          thai: result.thai,
          syllables,
          difficulty: 1,
        })
      } catch (err) {
        if (requestIdRef.current !== myRequestId) return
        const kind = err instanceof OnlineTranslateError ? err.kind : 'network'
        setAutoError(ONLINE_ERROR_MESSAGES[kind])
        setAutoErrorDetail(err instanceof OnlineTranslateError ? (err.detail ?? null) : String(err))
      } finally {
        if (requestIdRef.current === myRequestId) setAutoLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, lang, localMatch])

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

      {!query.trim() && (
        <p className="text-xs text-slate-500">
          Введите любую фразу — приложение само найдёт её в разговорнике или переведёт и разметит тоны
          автоматически.
        </p>
      )}

      {localMatch && <PhraseDisplay phrase={localMatch} />}

      {!localMatch && autoLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
          Переводим и определяем тоны…
        </div>
      )}

      {!localMatch && !autoLoading && autoError && (
        <div className="rounded-lg bg-red-950 px-3 py-2 text-xs text-red-300">
          <p>{autoError}</p>
          {autoErrorDetail && (
            <details className="mt-1 text-red-400">
              <summary className="cursor-pointer">Техническая причина</summary>
              <p className="mt-1 break-words">{autoErrorDetail}</p>
            </details>
          )}
        </div>
      )}

      {!localMatch && autoPhrase && (
        <div>
          <PhraseDisplay phrase={autoPhrase} showMeaning={false} showOriginalText />
          <p className="mt-1 text-[11px] text-slate-500">
            Автоматический перевод и тональная разметка (не сверено вручную с носителем языка).
          </p>
        </div>
      )}
    </div>
  )
}
