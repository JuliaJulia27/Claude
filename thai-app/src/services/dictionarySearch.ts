import { PHRASES } from '../data/phrases'
import type { Phrase } from '../domain/types'

export type SourceLang = 'ru' | 'fr'

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // снять диакритику (полезно для FR: é -> e)
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = Array(n + 1).fill(0).map((_, i) => i)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1])
      prev = tmp
    }
  }
  return dp[n]
}

export interface SearchResult {
  phrase: Phrase
  matchType: 'exact' | 'substring' | 'fuzzy'
  score: number // 0..1, выше — лучше
}

export function searchPhrases(query: string, lang: SourceLang, limit = 8): SearchResult[] {
  const q = normalize(query)
  if (!q) return []

  const results: SearchResult[] = []
  for (const phrase of PHRASES) {
    const target = normalize(lang === 'ru' ? phrase.ru : phrase.fr)
    if (!target) continue

    if (target === q) {
      results.push({ phrase, matchType: 'exact', score: 1 })
      continue
    }
    if (target.includes(q) || q.includes(target)) {
      const score = Math.min(target.length, q.length) / Math.max(target.length, q.length)
      results.push({ phrase, matchType: 'substring', score: 0.7 + 0.29 * score })
      continue
    }
    const dist = levenshtein(q, target)
    const maxLen = Math.max(q.length, target.length)
    const similarity = 1 - dist / maxLen
    if (similarity >= 0.55) {
      results.push({ phrase, matchType: 'fuzzy', score: similarity * 0.65 })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}

export type SentenceSegment =
  | { type: 'phrase'; phrase: Phrase; text: string }
  | { type: 'unknown'; text: string }

/**
 * Разбивает произвольное предложение на фрагменты, "жадно" находя внутри него
 * целые фразы из словаря (например, «спасибо» и «где туалет» внутри одного
 * длинного предложения), а не только отдельные слова. Несовпавшие слова
 * возвращаются как есть.
 */
export function segmentSentence(query: string, lang: SourceLang): SentenceSegment[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const phraseByNormText = new Map<string, Phrase>()
  let maxWords = 1
  for (const phrase of PHRASES) {
    const norm = normalize(lang === 'ru' ? phrase.ru : phrase.fr)
    if (!norm) continue
    if (!phraseByNormText.has(norm)) phraseByNormText.set(norm, phrase)
    maxWords = Math.max(maxWords, norm.split(/\s+/).length)
  }

  const segments: SentenceSegment[] = []
  let i = 0
  while (i < tokens.length) {
    const maxWindow = Math.min(maxWords, tokens.length - i)
    let matched = false
    for (let window = maxWindow; window >= 2; window--) {
      const chunk = tokens.slice(i, i + window).join(' ')
      const phrase = phraseByNormText.get(chunk)
      if (phrase) {
        segments.push({ type: 'phrase', phrase, text: chunk })
        i += window
        matched = true
        break
      }
    }
    if (matched) continue

    // Для одиночного оставшегося слова допускаем только точное совпадение:
    // подстрочный/нечёткий поиск на коротких словах (предлоги, союзы вроде «и»)
    // даёт случайные ложные срабатывания (например, «и» — подстрока слова «три»).
    const word = tokens[i]
    const exact = phraseByNormText.get(word)
    if (exact) {
      segments.push({ type: 'phrase', phrase: exact, text: word })
    } else {
      segments.push({ type: 'unknown', text: word })
    }
    i += 1
  }
  return segments
}
