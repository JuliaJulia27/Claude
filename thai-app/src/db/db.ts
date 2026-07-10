import Dexie, { type Table } from 'dexie'
import type { Tone } from '../domain/types'

export interface ProgressRow {
  phraseId: string
  easiness: number // фактор лёгкости SM-2, стартует с 2.5
  intervalDays: number
  repetitions: number
  dueAt: number // timestamp следующего повторения
  lastReviewedAt: number | null
}

export type ExerciseType = 'flashcard' | 'multiple-choice' | 'listening' | 'speaking'

export interface ToneAttemptDetail {
  syllableIndex: number
  targetTone: Tone
  detectedTone: Tone | null
  score: number // 0..100
}

export interface AttemptRow {
  id?: number
  phraseId: string
  type: ExerciseType
  correct: boolean
  timestamp: number
  toneDetails?: ToneAttemptDetail[]
}

class ThaiAppDB extends Dexie {
  progress!: Table<ProgressRow, string>
  attempts!: Table<AttemptRow, number>

  constructor() {
    super('thai-tones-db')
    this.version(1).stores({
      progress: 'phraseId, dueAt',
      attempts: '++id, phraseId, timestamp, type',
    })
  }
}

export const db = new ThaiAppDB()

const DAY_MS = 24 * 60 * 60 * 1000

/** Обновление интервала повторения по упрощённому алгоритму SM-2. */
export async function reviewPhrase(phraseId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) {
  const existing = await db.progress.get(phraseId)
  const prev: ProgressRow = existing ?? {
    phraseId,
    easiness: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: Date.now(),
    lastReviewedAt: null,
  }

  let { easiness, intervalDays, repetitions } = prev

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easiness)
    easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  }

  const next: ProgressRow = {
    phraseId,
    easiness,
    intervalDays,
    repetitions,
    dueAt: Date.now() + intervalDays * DAY_MS,
    lastReviewedAt: Date.now(),
  }
  await db.progress.put(next)
  return next
}

export async function logAttempt(row: Omit<AttemptRow, 'id' | 'timestamp'>) {
  await db.attempts.add({ ...row, timestamp: Date.now() })
}

export async function getDuePhraseIds(allIds: string[]): Promise<string[]> {
  const now = Date.now()
  const rows = await db.progress.toArray()
  const known = new Map(rows.map((r) => [r.phraseId, r]))
  return allIds.filter((id) => {
    const row = known.get(id)
    return !row || row.dueAt <= now
  })
}

export async function toneAccuracyStats(): Promise<Record<Tone, { total: number; avgScore: number }>> {
  const attempts = await db.attempts.where('type').equals('speaking').toArray()
  const acc: Record<Tone, { total: number; sum: number }> = {
    mid: { total: 0, sum: 0 },
    low: { total: 0, sum: 0 },
    falling: { total: 0, sum: 0 },
    high: { total: 0, sum: 0 },
    rising: { total: 0, sum: 0 },
  }
  for (const a of attempts) {
    for (const d of a.toneDetails ?? []) {
      acc[d.targetTone].total += 1
      acc[d.targetTone].sum += d.score
    }
  }
  const result = {} as Record<Tone, { total: number; avgScore: number }>
  for (const tone of Object.keys(acc) as Tone[]) {
    const { total, sum } = acc[tone]
    result[tone] = { total, avgScore: total ? Math.round(sum / total) : 0 }
  }
  return result
}

export async function exportUserData() {
  const [progress, attempts] = await Promise.all([db.progress.toArray(), db.attempts.toArray()])
  return { exportedAt: new Date().toISOString(), progress, attempts }
}

export async function importUserData(data: { progress: ProgressRow[]; attempts: AttemptRow[] }) {
  await db.transaction('rw', db.progress, db.attempts, async () => {
    await db.progress.bulkPut(data.progress)
    await db.attempts.bulkPut(data.attempts.map(({ id, ...rest }) => rest))
  })
}
