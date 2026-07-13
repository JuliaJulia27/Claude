import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Gender } from '../services/politeness'

export type UiLang = 'ru' | 'fr'
export type { Gender }

interface SettingsState {
  uiLang: UiLang
  translateSourceLang: UiLang
  gender: Gender
  setUiLang: (lang: UiLang) => void
  setTranslateSourceLang: (lang: UiLang) => void
  setGender: (gender: Gender) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      uiLang: 'ru',
      translateSourceLang: 'ru',
      gender: 'unspecified',
      setUiLang: (uiLang) => set({ uiLang }),
      setTranslateSourceLang: (translateSourceLang) => set({ translateSourceLang }),
      setGender: (gender) => set({ gender }),
    }),
    { name: 'thai-app-settings' },
  ),
)

export const UI_STRINGS = {
  ru: {
    appName: 'Thai Tones',
    translate: 'Перевод',
    phrasebook: 'Разговорник',
    lessons: 'Уроки',
    exercises: 'Упражнения',
    toneTrainer: 'Тренажёр тонов',
    progress: 'Прогресс',
    settings: 'Настройки',
    home: 'Главная',
  },
  fr: {
    appName: 'Thai Tones',
    translate: 'Traduction',
    phrasebook: 'Recueil de phrases',
    lessons: 'Leçons',
    exercises: 'Exercices',
    toneTrainer: 'Entraîneur de tons',
    progress: 'Progrès',
    settings: 'Paramètres',
    home: 'Accueil',
  },
} as const

export function useUiStrings() {
  const lang = useSettings((s) => s.uiLang)
  return UI_STRINGS[lang]
}
