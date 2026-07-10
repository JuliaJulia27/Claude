import { PHRASES } from '../data/phrases'
import type { Category, Phrase } from '../domain/types'

export function phrasesForExercise(category: Category | null): Phrase[] {
  return category ? PHRASES.filter((p) => p.category === category) : PHRASES
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Правильный ответ + 3 случайных отвлекающих варианта из общего пула фраз. */
export function buildMultipleChoice(correct: Phrase, pool: Phrase[], count = 4): Phrase[] {
  const distractors = shuffle(pool.filter((p) => p.id !== correct.id)).slice(0, count - 1)
  return shuffle([correct, ...distractors])
}

export function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}
