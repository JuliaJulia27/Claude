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
