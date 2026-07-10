import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PHRASES } from '../data/phrases'
import { phrasesForExercise } from '../services/exerciseHelpers'
import { PitchRecorder, isMicSupported } from '../services/pitchDetector'
import { scoreTone, contourToSvgPath, normalizeContour, type ToneScoreResult } from '../services/toneScorer'
import { ToneCurveOverlay } from '../components/ToneCurve'
import { TONE_LABELS } from '../domain/types'
import { speakThai, isTtsSupported } from '../services/ttsPlayer'
import { logAttempt } from '../db/db'
import { useSettings } from '../hooks/useSettings'
import type { Category } from '../domain/types'

type RecState = 'idle' | 'recording' | 'scored' | 'error'

export function ToneTrainerScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [params] = useSearchParams()
  const category = (params.get('category') as Category | null) ?? 'tones'
  const deck = useMemo(() => (phrasesForExercise(category).length ? phrasesForExercise(category) : PHRASES), [category])

  const [phraseIdx, setPhraseIdx] = useState(0)
  const [sylIdx, setSylIdx] = useState(0)
  const phrase = deck[phraseIdx % deck.length]
  const syllable = phrase.syllables[sylIdx % phrase.syllables.length]

  const recorderRef = useRef<PitchRecorder | null>(null)
  const [state, setState] = useState<RecState>('idle')
  const [result, setResult] = useState<ToneScoreResult | null>(null)
  const [userPath, setUserPath] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  async function startRecording() {
    setError(null)
    setResult(null)
    setUserPath(undefined)
    if (!isMicSupported()) {
      setError(uiLang === 'ru' ? 'Микрофон недоступен в этом браузере.' : "Microphone indisponible dans ce navigateur.")
      setState('error')
      return
    }
    try {
      const recorder = new PitchRecorder()
      recorderRef.current = recorder
      await recorder.start()
      setState('recording')
    } catch {
      setError(
        uiLang === 'ru'
          ? 'Нет доступа к микрофону. Разрешите доступ в настройках браузера.'
          : "Accès au microphone refusé. Autorisez-le dans les réglages du navigateur.",
      )
      setState('error')
    }
  }

  async function stopRecording() {
    const recorder = recorderRef.current
    if (!recorder) return
    const samples = recorder.stop()
    const scored = scoreTone(samples, syllable.tone)
    if (!scored) {
      setError(
        uiLang === 'ru'
          ? 'Не удалось распознать голос — попробуйте говорить чуть громче и дольше.'
          : "Impossible de détecter la voix — essayez de parler un peu plus fort et plus longtemps.",
      )
      setState('error')
      return
    }
    const contour = normalizeContour(samples)
    setUserPath(contour ? contourToSvgPath(contour) : undefined)
    setResult(scored)
    setState('scored')
    await logAttempt({
      phraseId: phrase.id,
      type: 'speaking',
      correct: scored.score >= 60,
      toneDetails: [{ syllableIndex: sylIdx, targetTone: syllable.tone, detectedTone: scored.detectedTone, score: scored.score }],
    })
  }

  function nextSyllable() {
    setResult(null)
    setUserPath(undefined)
    setState('idle')
    if (sylIdx + 1 < phrase.syllables.length) {
      setSylIdx((i) => i + 1)
    } else {
      setSylIdx(0)
      setPhraseIdx((i) => i + 1)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
        <p className="thai-script text-3xl">{syllable.thai}</p>
        <p className="text-lg font-medium text-emerald-300">{syllable.cyr}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{TONE_LABELS[syllable.tone][uiLang]}</p>
        {isTtsSupported() && (
          <button
            onClick={() => speakThai(phrase.thai)}
            className="mt-2 rounded-full bg-slate-800 px-3 py-1.5 text-sm"
          >
            🔊 {uiLang === 'ru' ? 'Эталон' : 'Référence'}
          </button>
        )}
      </div>

      <div className="flex justify-center rounded-xl border border-slate-800 bg-slate-900 p-4">
        <ToneCurveOverlay tone={syllable.tone} userPath={userPath} />
      </div>

      {error && <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {result && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{result.score}%</p>
          <p className="text-sm text-slate-400">
            {uiLang === 'ru' ? 'Распознанный тон' : 'Ton détecté'}:{' '}
            <span className="font-semibold text-slate-200">{TONE_LABELS[result.detectedTone][uiLang]}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {state !== 'recording' ? (
          <button
            onClick={startRecording}
            className="flex-1 rounded-lg bg-red-500 py-3 font-semibold text-red-950 active:scale-95"
          >
            🎙️ {uiLang === 'ru' ? 'Записать' : 'Enregistrer'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 animate-pulse rounded-lg bg-red-600 py-3 font-semibold text-white active:scale-95"
          >
            ⏹ {uiLang === 'ru' ? 'Стоп' : 'Arrêter'}
          </button>
        )}
        <button onClick={nextSyllable} className="rounded-lg bg-slate-800 px-4 py-3 font-semibold">
          {uiLang === 'ru' ? 'Далее →' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}
