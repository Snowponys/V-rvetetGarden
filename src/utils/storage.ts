import type { GardenState } from '../types'

const KEY = 'varvetet_garden_v1'

export function loadGarden(): GardenState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as GardenState
  } catch {
    // ignore
  }
  return { plants: [], placedPlants: [] }
}

export function saveGarden(state: GardenState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}
