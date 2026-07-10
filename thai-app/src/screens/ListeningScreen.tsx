import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PHRASES } from '../data/phrases'
import { phrasesForExercise, buildMultipleChoice } from '../services/exerciseHelpers'
import { speakThai, isTtsSupported, hasThaiVoice } from '../services/ttsPlayer'
import { logAttempt } from '../db/db'
import { useSettings } from '../hooks/useSettings'
import type { Category, Phrase } from '../domain/types'

function useRound(category: Category | null, roundKey: number) {
  const deck = useMemo(() => phrasesForExercise(category), [category])
  return useMemo(() => {
    const correct = deck[Math.floor(Math.random() * deck.length)]
    const options = buildMultipleChoice(correct, PHRASES)
    return { correct, options }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, roundKey])
}

export function ListeningScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [params] = useSearchParams()
  const category = params.get('category') as Category | null

  const [round, setRound] = useState(0)
  const { correct, options } = useRound(category, round)
  const [selected, setSelected] = useState<Phrase | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  useEffect(() => {
    if (correct) speakThai(correct.thai)
  }, [correct])

  async function choose(option: Phrase) {
    if (selected) return
    setSelected(option)
    const isCorrect = option.id === correct.id
    setScore((s) => ({ right: s.right + (isCorrect ? 1 : 0), total: s.total + 1 }))
    await logAttempt({ phraseId: correct.id, type: 'listening', correct: isCorrect })
  }

  if (!correct) return <p className="p-4">Нет фраз для этой категории.</p>

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <p className="text-sm text-slate-500">
        {uiLang === 'ru' ? `Счёт: ${score.right}/${score.total}` : `Score : ${score.right}/${score.total}`}
      </p>

      {isTtsSupported() && !hasThaiVoice() && (
        <p className="rounded-lg bg-amber-950 px-3 py-2 text-xs text-amber-300">
          {uiLang === 'ru'
            ? 'В вашем браузере не найден тайский голос TTS — озвучка может звучать неточно.'
            : "Aucune voix TTS thaïe trouvée dans votre navigateur — la prononciation peut être imprécise."}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <button
          onClick={() => speakThai(correct.thai)}
          className="rounded-full bg-emerald-500 p-5 text-3xl text-emerald-950 active:scale-95"
          aria-label="Прослушать снова"
        >
          🔊
        </button>
        <p className="text-xs text-slate-500">{uiLang === 'ru' ? 'Что вы услышали?' : 'Qu’avez-vous entendu ?'}</p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrectOpt = opt.id === correct.id
          const showState = selected !== null
          const style = !showState
            ? 'border-slate-800 bg-slate-900'
            : isCorrectOpt
              ? 'border-emerald-500 bg-emerald-950'
              : opt.id === selected?.id
                ? 'border-red-500 bg-red-950'
                : 'border-slate-800 bg-slate-900 opacity-50'
          return (
            <button key={opt.id} onClick={() => choose(opt)} className={`w-full rounded-xl border p-3 text-left ${style}`}>
              {uiLang === 'ru' ? opt.ru : opt.fr}
            </button>
          )
        })}
      </div>

      {selected && (
        <button
          onClick={() => setRound((r) => r + 1)}
          className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-emerald-950"
        >
          {uiLang === 'ru' ? 'Далее' : 'Suivant'}
        </button>
      )}
    </div>
  )
}
