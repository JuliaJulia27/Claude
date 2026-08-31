/** L'API Navitia renvoie les couleurs en hexadécimal sans le "#" initial. */
export function toHex(color: string | undefined | null, fallback = '#64748b'): string {
  if (!color) return fallback
  return color.startsWith('#') ? color : `#${color}`
}
