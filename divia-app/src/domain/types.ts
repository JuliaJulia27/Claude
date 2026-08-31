export type Mode = 'tramway' | 'bus'

/** Ligne + arrêt choisis par l'utilisateur : suffisant pour relancer les
 *  horaires sans re-télécharger la liste des lignes/arrêts. */
export interface Selection {
  mode: Mode
  lineId: string
  lineCode: string
  lineName: string
  lineColor: string
  lineTextColor: string
  stopId: string
  stopName: string
}

export type FavoriteEntry = Selection & { id: string }
