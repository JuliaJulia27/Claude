import type { Phrase } from '../domain/types'
import { TONE_LABELS } from '../domain/types'
import { ToneCurve } from './ToneCurve'
import { speakThai, isTtsSupported } from '../services/ttsPlayer'
import { useSettings } from '../hooks/useSettings'

interface PhraseDisplayProps {
  phrase: Phrase
  showMeaning?: boolean
  showOriginalText?: boolean
  compact?: boolean
}

export function PhraseDisplay({ phrase, showMeaning = true, showOriginalText = false, compact = false }: PhraseDisplayProps) {
  const uiLang = useSettings((s) => s.uiLang)
  const meaning = uiLang === 'ru' ? phrase.ru : phrase.fr

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-3">
          {phrase.syllables.map((syl, i) => (
            <div key={i} className="flex flex-col items-center">
              <ToneCurve tone={syl.tone} size={compact ? 22 : 30} />
              <span className="thai-script text-lg text-slate-200">{syl.thai}</span>
              <span className="text-sm font-medium text-emerald-300">{syl.cyr}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                {TONE_LABELS[syl.tone][uiLang]}
              </span>
            </div>
          ))}
        </div>
        {isTtsSupported() && (
          <button
            onClick={() => speakThai(phrase.thai)}
            aria-label="Прослушать произношение"
            className="shrink-0 rounded-full bg-slate-800 p-2.5 text-lg hover:bg-slate-700 active:scale-95"
          >
            🔊
          </button>
        )}
      </div>
      {showMeaning && <p className="mt-3 text-slate-300">{meaning}</p>}
      {phrase.notes && <p className="mt-1 text-xs text-slate-500">{phrase.notes}</p>}
      {showOriginalText && (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            {uiLang === 'ru' ? 'Оригинальный перевод' : 'Traduction originale'}
          </p>
          <p className="thai-script mt-1 text-lg text-slate-300">{phrase.thai}</p>
        </div>
      )}
    </div>
  )
}
