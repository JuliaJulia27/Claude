import { useMemo, useState } from 'react'
import { searchPhrases, wordByWordBreakdown } from '../services/dictionarySearch'
import { PhraseDisplay } from '../components/PhraseDisplay'
import { useSettings } from '../hooks/useSettings'

export function TranslateScreen() {
  const [query, setQuery] = useState('')
  const lang = useSettings((s) => s.translateSourceLang)
  const setLang = useSettings((s) => s.setTranslateSourceLang)

  const results = useMemo(() => searchPhrases(query, lang), [query, lang])
  const breakdown = useMemo(
    () => (results.length === 0 && query.trim() ? wordByWordBreakdown(query, lang) : []),
    [results, query, lang],
  )

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

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === 'ru' ? 'Введите фразу по-русски…' : 'Entrez une phrase en français…'}
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        autoFocus
      />

      <p className="text-xs text-slate-500">
        Поиск идёт по локальному куррированному разговорнику (без доступа в интернет). Точных или похожих слов не
        нашлось — попробуйте другую формулировку или загляните в разговорник по темам.
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

      {breakdown.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Точной фразы нет, вот перевод по словам:</p>
          {breakdown.map((b, i) =>
            b.match ? (
              <PhraseDisplay key={i} phrase={b.match} />
            ) : (
              <p key={i} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500">
                «{b.word}» — нет в словаре
              </p>
            ),
          )}
        </div>
      )}
    </div>
  )
}
