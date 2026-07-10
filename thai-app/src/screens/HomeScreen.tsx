import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PHRASES } from '../data/phrases'
import { getDuePhraseIds } from '../db/db'
import { useSettings } from '../hooks/useSettings'

const CARDS = [
  { to: '/translate', title: { ru: 'Перевести фразу', fr: 'Traduire une phrase' }, icon: '🔤', desc: { ru: 'RU/FR → тайский с тонами', fr: 'RU/FR → thaï avec les tons' } },
  { to: '/phrasebook', title: { ru: 'Разговорник', fr: 'Recueil de phrases' }, icon: '📖', desc: { ru: 'Фразы по темам', fr: 'Phrases par thème' } },
  { to: '/lessons', title: { ru: 'Уроки', fr: 'Leçons' }, icon: '🎓', desc: { ru: 'Теория и практика по темам', fr: 'Théorie et pratique par thème' } },
  { to: '/tone-trainer', title: { ru: 'Тренажёр тонов', fr: 'Entraîneur de tons' }, icon: '🎙️', desc: { ru: 'Запись голоса и оценка тона', fr: 'Enregistrement vocal et score de ton' } },
  { to: '/exercises', title: { ru: 'Упражнения', fr: 'Exercices' }, icon: '✍️', desc: { ru: 'Карточки, тесты, аудирование', fr: 'Cartes, quiz, écoute' } },
]

export function HomeScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [dueCount, setDueCount] = useState<number | null>(null)

  useEffect(() => {
    getDuePhraseIds(PHRASES.map((p) => p.id)).then((ids) => setDueCount(ids.length))
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600/20 to-slate-900 p-5">
        <p className="text-sm text-emerald-300">
          {uiLang === 'ru' ? 'Сегодня к повторению' : "À réviser aujourd'hui"}
        </p>
        <p className="text-3xl font-bold">{dueCount ?? '…'}</p>
        <Link
          to="/exercises/flashcards"
          className="mt-3 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
        >
          {uiLang === 'ru' ? 'Начать повторение' : 'Commencer la révision'}
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-emerald-600"
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="font-semibold">{c.title[uiLang]}</span>
            <span className="text-xs text-slate-400">{c.desc[uiLang]}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
