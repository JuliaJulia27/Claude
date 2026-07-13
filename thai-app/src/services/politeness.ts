import type { Phrase, Syllable } from '../domain/types'

export type Gender = 'male' | 'female' | 'unspecified'

const MALE_PARTICLE: Syllable = { thai: 'ครับ', cyr: 'кхрап', tone: 'high' }
const FEMALE_STATEMENT: Syllable = { thai: 'ค่ะ', cyr: 'кха', tone: 'falling' }
const FEMALE_QUESTION: Syllable = { thai: 'คะ', cyr: 'кха', tone: 'high' }

const PARTICLE_THAI = new Set(['ครับ', 'ค่ะ', 'คะ'])

/**
 * Добавляет вежливую частицу в конец фразы в зависимости от пола говорящего:
 * ครับ (мужской), ค่ะ (женский, утверждение) или คะ (женский, вопрос —
 * определяется по "?" в конце исходного текста). Не дублирует частицу, если
 * фраза уже ею оканчивается (например курированная запись "ครับ" сама по себе).
 */
export function withPoliteParticle(phrase: Phrase, gender: Gender, sourceText: string): Phrase {
  if (gender === 'unspecified' || phrase.syllables.length === 0) return phrase

  const lastThai = phrase.syllables[phrase.syllables.length - 1].thai
  if (PARTICLE_THAI.has(lastThai)) return phrase

  const isQuestion = /[?？]\s*$/.test(sourceText.trim())
  const particle = gender === 'male' ? MALE_PARTICLE : isQuestion ? FEMALE_QUESTION : FEMALE_STATEMENT

  return {
    ...phrase,
    thai: phrase.thai + particle.thai,
    syllables: [...phrase.syllables, particle],
  }
}
