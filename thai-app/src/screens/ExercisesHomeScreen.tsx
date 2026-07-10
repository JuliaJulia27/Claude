import { Link, useSearchParams } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'

const TYPES = [
  { path: 'flashcards', icon: '🗂️', title: { ru: 'Флеш-карточки', fr: 'Cartes mémoire' }, desc: { ru: 'Повторение по интервалам (SRS)', fr: 'Répétition espacée (SRS)' } },
  { path: 'quiz', icon: '❓', title: { ru: 'Тест с вариантами', fr: 'Quiz à choix multiples' }, desc: { ru: 'Выберите правильный перевод', fr: 'Choisissez la bonne traduction' } },
  { path: 'listening', icon: '👂', title: { ru: 'На слух', fr: "À l'écoute" }, desc: { ru: 'Услышьте и узнайте фразу', fr: 'Écoutez et reconnaissez la phrase' } },
]

export function ExercisesHomeScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [params] = useSearchParams()
  const category = params.get('category')

  return (
    <div className="mx-auto max-w-lg space-y-3 px-4 py-5">
      {TYPES.map((t) => (
        <Link
          key={t.path}
          to={`/exercises/${t.path}${category ? `?category=${category}` : ''}`}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-emerald-600"
        >
          <span className="text-2xl">{t.icon}</span>
          <div>
            <p className="font-semibold">{t.title[uiLang]}</p>
            <p className="text-xs text-slate-400">{t.desc[uiLang]}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
