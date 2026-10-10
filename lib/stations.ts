import { STATION_DATA } from './station-data'

export type Station = {
  name: string
  code: string
}

export const DEFAULT_STATIONS: Station[] = STATION_DATA.map(([name, code]) => ({ name, code }))

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

export const normalizeName = (name: string) => name.trim().toUpperCase().replace(/\s+/g, ' ')

export function searchStations(stations: Station[], query: string, exclude: Station[] = [], limit = 8): Station[] {
  const q = query.trim().toUpperCase()
  if (!q) return []
  const excluded = new Set(exclude.map((s) => `${s.name}|${s.code}`))

  const ranked: { score: number; station: Station }[] = []
  for (const station of stations) {
    if (excluded.has(`${station.name}|${station.code}`)) continue
    let score = -1
    if (station.code === q) score = 0
    else if (station.code.startsWith(q)) score = 1
    else if (station.name.startsWith(q)) score = 2
    else if (station.name.split(/[\s/().-]+/).some((word) => word.startsWith(q))) score = 3
    else if (station.name.includes(q)) score = 4
    if (score >= 0) ranked.push({ score, station })
  }

  return ranked
    .sort((a, b) => a.score - b.score || a.station.name.localeCompare(b.station.name))
    .slice(0, limit)
    .map((r) => r.station)
}
