import { useState } from 'react'
import type { Mode, Selection, FavoriteEntry } from './domain/types'
import type { LineObject, StopAreaObject } from './api/divia'
import { useLines } from './hooks/useLines'
import { useStops } from './hooks/useStops'
import { useSchedules } from './hooks/useSchedules'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ModeToggle } from './components/ModeToggle'
import { LineList } from './components/LineList'
import { StopPicker } from './components/StopPicker'
import { ScheduleBoard } from './components/ScheduleBoard'
import { toHex } from './utils/color'

type View = 'picker-line' | 'picker-stop' | 'board'

function App() {
  const [selection, setSelection] = useLocalStorage<Selection | null>('divia:last-selection', null)
  const [favorites, setFavorites] = useLocalStorage<FavoriteEntry[]>('divia:favorites', [])
  const [mode, setMode] = useState<Mode>(selection?.mode ?? 'tramway')
  const [pendingLine, setPendingLine] = useState<LineObject | null>(null)
  const [view, setView] = useState<View>(selection ? 'board' : 'picker-line')

  const { lines, loading: linesLoading, error: linesError } = useLines(mode)
  const { stops, loading: stopsLoading, error: stopsError } = useStops(pendingLine?.id ?? null)
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    updatedAt,
    refresh,
  } = useSchedules(view === 'board' ? (selection?.lineId ?? null) : null, view === 'board' ? (selection?.stopId ?? null) : null)

  function chooseLine(line: LineObject) {
    setPendingLine(line)
    setView('picker-stop')
  }

  function chooseStop(stop: StopAreaObject) {
    if (!pendingLine) return
    const next: Selection = {
      mode,
      lineId: pendingLine.id,
      lineCode: pendingLine.code,
      lineName: pendingLine.name,
      lineColor: toHex(pendingLine.color),
      lineTextColor: toHex(pendingLine.text_color, '#ffffff'),
      stopId: stop.id,
      stopName: stop.name,
    }
    setSelection(next)
    setView('board')
  }

  function isFavorite(sel: Selection) {
    return favorites.some((f) => f.lineId === sel.lineId && f.stopId === sel.stopId)
  }

  function toggleFavorite() {
    if (!selection) return
    const id = `${selection.lineId}:${selection.stopId}`
    setFavorites((prev) => (prev.some((f) => f.id === id) ? prev.filter((f) => f.id !== id) : [...prev, { ...selection, id }]))
  }

  function openFavorite(fav: FavoriteEntry) {
    setSelection(fav)
    setMode(fav.mode)
    setPendingLine(null)
    setView('board')
  }

  function changeLine() {
    setPendingLine(null)
    setView('picker-line')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-6">
      <header>
        <h1 className="text-lg font-bold text-white">Divia · Prochains passages</h1>
        <p className="text-xs text-slate-500">Trams et bus DiviaMobilités — Dijon Métropole</p>
      </header>

      {favorites.length > 0 && view !== 'picker-stop' && (
        <div className="flex flex-wrap gap-2">
          {favorites.map((fav) => (
            <button
              key={fav.id}
              onClick={() => openFavorite(fav)}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: fav.lineColor, color: fav.lineTextColor }}
              >
                {fav.lineCode}
              </span>
              {fav.stopName}
            </button>
          ))}
        </div>
      )}

      {view === 'board' && selection ? (
        <>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: selection.lineColor, color: selection.lineTextColor }}
              >
                {selection.lineCode}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{selection.stopName}</p>
                <p className="text-xs text-slate-400">{selection.lineName}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={toggleFavorite}
                aria-label={isFavorite(selection) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={`text-xl leading-none ${isFavorite(selection) ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                ★
              </button>
              <button onClick={changeLine} className="text-xs text-sky-400 hover:text-sky-300">
                Changer
              </button>
            </div>
          </div>

          <ScheduleBoard schedules={schedules} loading={schedulesLoading} error={schedulesError} updatedAt={updatedAt} onRefresh={refresh} />
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <ModeToggle
            mode={mode}
            onChange={(m) => {
              setMode(m)
              setPendingLine(null)
              setView('picker-line')
            }}
          />
          {view === 'picker-line' && <LineList lines={lines} loading={linesLoading} error={linesError} onSelect={chooseLine} />}
          {view === 'picker-stop' && (
            <StopPicker stops={stops} loading={stopsLoading} error={stopsError} onSelect={chooseStop} onBack={() => setView('picker-line')} />
          )}
        </div>
      )}

      <footer className="mt-auto pt-4 text-center text-[11px] text-slate-600">
        Données non officielles du réseau DiviaMobilités (Dijon Métropole), via le service temps réel Navitia/Hove.
      </footer>
    </div>
  )
}

export default App
