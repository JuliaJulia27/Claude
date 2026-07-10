import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UiLang = 'ru' | 'fr'

interface SettingsState {
  uiLang: UiLang
  translateSourceLang: UiLang
  setUiLang: (lang: UiLang) => void
  setTranslateSourceLang: (lang: UiLang) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      uiLang: 'ru',
      translateSourceLang: 'ru',
      setUiLang: (uiLang) => set({ uiLang }),
      setTranslateSourceLang: (translateSourceLang) => set({ translateSourceLang }),
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
