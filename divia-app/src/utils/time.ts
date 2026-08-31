/** Heure d'horloge à Dijon, quel que soit le fuseau du navigateur. */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
}

/** Temps restant avant le passage, arrondi à la minute. */
export function formatRelative(date: Date, now: number): string {
  const diffMin = Math.round((date.getTime() - now) / 60_000)
  if (diffMin <= 0) return 'imminent'
  if (diffMin < 60) return `${diffMin} min`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m === 0 ? `${h} h` : `${h} h ${m}`
}
