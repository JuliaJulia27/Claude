// Пять тонов тайского языка.
export type Tone = 'mid' | 'low' | 'falling' | 'high' | 'rising'

export const TONES: Tone[] = ['mid', 'low', 'falling', 'high', 'rising']

export const TONE_LABELS: Record<Tone, { ru: string; fr: string; symbol: string }> = {
  mid: { ru: 'средний', fr: 'moyen', symbol: '˧' },
  low: { ru: 'низкий', fr: 'bas', symbol: '˨' },
  falling: { ru: 'нисходящий', fr: 'descendant', symbol: '˥˩' },
  high: { ru: 'высокий', fr: 'haut', symbol: '˦' },
  rising: { ru: 'восходящий', fr: 'montant', symbol: '˩˥' },
}

// Один слог: тайское написание, кириллическая транскрипция и тон.
export interface Syllable {
  thai: string
  cyr: string
  tone: Tone
}

export type Category =
  | 'greetings'
  | 'numbers'
  | 'basics'
  | 'food'
  | 'directions'
  | 'shopping'
  | 'emergency'
  | 'family'
  | 'time'
  | 'tones'

export const CATEGORY_LABELS: Record<Category, { ru: string; fr: string }> = {
  greetings: { ru: 'Приветствия', fr: 'Salutations' },
  numbers: { ru: 'Числа', fr: 'Nombres' },
  basics: { ru: 'Базовые фразы', fr: 'Phrases de base' },
  food: { ru: 'Еда', fr: 'Nourriture' },
  directions: { ru: 'Направления', fr: 'Directions' },
  shopping: { ru: 'Покупки', fr: 'Achats' },
  emergency: { ru: 'Экстренные ситуации', fr: 'Urgences' },
  family: { ru: 'Семья', fr: 'Famille' },
  time: { ru: 'Время', fr: 'Temps' },
  tones: { ru: 'Тренировка тонов', fr: 'Entraînement des tons' },
}

export interface Phrase {
  id: string
  category: Category
  ru: string
  fr: string
  thai: string
  syllables: Syllable[]
  difficulty: 1 | 2 | 3
  notes?: string
}

export function phraseCyr(p: Phrase): string {
  return p.syllables.map((s) => s.cyr).join(' ')
}
