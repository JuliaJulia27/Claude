import { searchPhrases, type SourceLang } from './dictionarySearch'
import { translateOnline } from './onlineTranslate'
import { readThai } from './thaiReading'
import type { Phrase } from '../domain/types'

const LOCAL_MATCH_THRESHOLD = 0.85

/** Переводит одно слово: сперва куррированный словарь, иначе — онлайн-перевод + автоматическая тональная разметка. */
export async function translateWord(word: string, lang: SourceLang): Promise<Phrase | null> {
  const hit = searchPhrases(word, lang, 1)[0]
  if (hit && hit.score >= LOCAL_MATCH_THRESHOLD) return hit.phrase

  try {
    const result = await translateOnline(word, lang)
    return {
      id: `word-${word}`,
      category: 'basics',
      ru: lang === 'ru' ? word : '',
      fr: lang === 'fr' ? word : '',
      thai: result.thai,
      syllables: readThai(result.thai),
      difficulty: 1,
    }
  } catch {
    return null
  }
}

/** Извлекает отдельные слова из фразы для построения словарика (без пунктуации). */
export function splitIntoWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean)
}
