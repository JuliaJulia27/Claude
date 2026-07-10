import type { Tone } from '../domain/types'
import type { PitchSample } from './pitchDetector'

const RESAMPLE_POINTS = 10

// Эталонные контуры (0 = самый низкий тон голоса, 1 = самый высокий), 10 точек по времени.
// Форма соответствует традиционной 5-уровневой схеме тайских тонов.
const REFERENCE_CONTOURS: Record<Tone, number[]> = {
  mid: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  low: [0.35, 0.32, 0.3, 0.27, 0.24, 0.21, 0.18, 0.16, 0.14, 0.13],
  falling: [0.95, 0.9, 0.82, 0.7, 0.58, 0.46, 0.34, 0.24, 0.16, 0.1],
  high: [0.55, 0.6, 0.67, 0.74, 0.8, 0.86, 0.9, 0.93, 0.95, 0.96],
  rising: [0.4, 0.32, 0.25, 0.2, 0.18, 0.22, 0.35, 0.55, 0.75, 0.9],
}

export function referenceContour(tone: Tone): number[] {
  return REFERENCE_CONTOURS[tone]
}

function hzToSemitone(hz: number): number {
  return 12 * Math.log2(hz / 55) // A1=55Hz как условная точка отсчёта
}

/** Отбирает "звучащий" участок записи и приводит его к RESAMPLE_POINTS точкам в диапазоне 0..1. */
export function normalizeContour(samples: PitchSample[]): number[] | null {
  const voiced = samples.filter((s) => s.freqHz !== null) as { t: number; freqHz: number }[]
  if (voiced.length < 4) return null

  const semitones = voiced.map((s) => hzToSemitone(s.freqHz))
  const min = Math.min(...semitones)
  const max = Math.max(...semitones)
  const range = max - min || 1

  const t0 = voiced[0].t
  const t1 = voiced[voiced.length - 1].t
  const duration = t1 - t0 || 1

  const resampled: number[] = []
  for (let i = 0; i < RESAMPLE_POINTS; i++) {
    const targetT = t0 + (i / (RESAMPLE_POINTS - 1)) * duration
    // ближайший сосед по времени
    let closestIdx = 0
    let closestDist = Infinity
    for (let j = 0; j < voiced.length; j++) {
      const dist = Math.abs(voiced[j].t - targetT)
      if (dist < closestDist) { closestDist = dist; closestIdx = j }
    }
    resampled.push((semitones[closestIdx] - min) / range)
  }
  return resampled
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0, denomA = 0, denomB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denomA += da * da
    denomB += db * db
  }
  const denom = Math.sqrt(denomA * denomB)
  if (denom === 0) return 0
  return num / denom
}

export interface ToneScoreResult {
  score: number // 0..100 — насколько форма контура похожа на целевой тон
  detectedTone: Tone
  perToneCorrelation: Record<Tone, number>
}

export function scoreTone(samples: PitchSample[], targetTone: Tone): ToneScoreResult | null {
  const contour = normalizeContour(samples)
  if (!contour) return null

  const perToneCorrelation = {} as Record<Tone, number>
  let bestTone: Tone = 'mid'
  let bestCorr = -Infinity
  for (const tone of Object.keys(REFERENCE_CONTOURS) as Tone[]) {
    const corr = pearsonCorrelation(contour, REFERENCE_CONTOURS[tone])
    perToneCorrelation[tone] = corr
    if (corr > bestCorr) { bestCorr = corr; bestTone = tone }
  }

  const targetCorr = perToneCorrelation[targetTone]
  const score = Math.max(0, Math.min(100, Math.round(((targetCorr + 1) / 2) * 100)))

  return { score, detectedTone: bestTone, perToneCorrelation }
}

/** Строит SVG path (совместимый с ToneCurve) по нормализованному контуру для наложения. */
export function contourToSvgPath(contour: number[]): string {
  const points = contour.map((v, i) => {
    const x = 4 + (i / (contour.length - 1)) * 92
    const y = 4 + (1 - v) * 32
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return 'M' + points.join(' L')
}
