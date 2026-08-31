// Fine couche au-dessus du paquet `divia-api` (non officiel, MIT) : celui-ci
// interroge en direct, depuis le navigateur, le proxy pré-signé de Navitia
// (nws-main.hove.io) qui sert les données temps réel du réseau DiviaMobilités
// (Dijon Métropole) — aucune clé API n'est nécessaire côté client.
//
// Cette couche ajoute juste : des messages d'erreur compréhensibles, et un
// cache court (localStorage) sur la liste des arrêts d'une ligne, qui change
// rarement et évite un aller-retour réseau à chaque changement de ligne.
import { listLines as fetchLines, listStops as fetchStops, getSchedules as fetchSchedules } from 'divia-api'
import type { LineObject, StopAreaObject, ScheduleObject } from 'divia-api'

export type { LineObject, StopAreaObject, ScheduleObject }

const STOPS_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

function readStopsCache(lineId: string): StopAreaObject[] | null {
  try {
    const raw = localStorage.getItem(`divia:stops:${lineId}`)
    if (!raw) return null
    const { at, data } = JSON.parse(raw) as { at: number; data: StopAreaObject[] }
    if (Date.now() - at > STOPS_CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeStopsCache(lineId: string, data: StopAreaObject[]) {
  try {
    localStorage.setItem(`divia:stops:${lineId}`, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // stockage indisponible (navigation privée, quota atteint...) : tant pis
  }
}

async function withFriendlyError<T>(promise: Promise<T>, context: string): Promise<T> {
  try {
    return await promise
  } catch (err) {
    console.error(`[divia] ${context}`, err)
    throw new Error(`Impossible de contacter le service Divia (${context}). Réessayez dans quelques instants.`)
  }
}

export async function listLines(mode: 'bus' | 'tramway'): Promise<LineObject[]> {
  return withFriendlyError(fetchLines(mode), 'liste des lignes')
}

export async function listStops(lineId: string): Promise<StopAreaObject[]> {
  const cached = readStopsCache(lineId)
  if (cached) return cached
  const stops = await withFriendlyError(fetchStops(lineId), 'liste des arrêts')
  writeStopsCache(lineId, stops)
  return stops
}

export async function getSchedules(lineId: string, stopAreaId: string): Promise<ScheduleObject[]> {
  return withFriendlyError(fetchSchedules(lineId, stopAreaId), 'horaires')
}
