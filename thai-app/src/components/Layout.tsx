import { NavLink, Outlet } from 'react-router-dom'
import { useUiStrings } from '../hooks/useSettings'

const TABS = [
  { to: '/', icon: '🏠', key: 'home' as const },
  { to: '/translate', icon: '🔤', key: 'translate' as const },
  { to: '/phrasebook', icon: '📖', key: 'phrasebook' as const },
  { to: '/lessons', icon: '🎓', key: 'lessons' as const },
  { to: '/tone-trainer', icon: '🎙️', key: 'toneTrainer' as const },
  { to: '/progress', icon: '📊', key: 'progress' as const },
]

export function Layout() {
  const t = useUiStrings()
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight">{t.appName}</h1>
        <NavLink to="/settings" aria-label="Настройки" className="text-lg text-slate-400 hover:text-slate-200">
          ⚙️
        </NavLink>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <ul className="mx-auto flex max-w-lg justify-between px-2 py-1">
          {TABS.map((tab) => (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-lg py-2 text-[11px] transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`
                }
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span>{t[tab.key]}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
