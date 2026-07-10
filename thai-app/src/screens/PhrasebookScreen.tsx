import { useState } from 'react'
import { PHRASES } from '../data/phrases'
import type { Category } from '../domain/types'
import { CATEGORY_LABELS } from '../domain/types'
import { PhraseDisplay } from '../components/PhraseDisplay'
import { useSettings } from '../hooks/useSettings'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export function PhrasebookScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const [active, setActive] = useState<Category>('greetings')
  const items = PHRASES.filter((p) => p.category === active)

  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              active === c ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {CATEGORY_LABELS[c][uiLang]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <PhraseDisplay key={p.id} phrase={p} />
        ))}
      </div>
    </div>
  )
}
