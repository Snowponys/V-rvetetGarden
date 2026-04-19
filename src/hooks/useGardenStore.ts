import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { GardenState, Plant, PlacedPlant } from '../types'
import { loadGarden, saveGarden } from '../utils/storage'

export function useGardenStore() {
  const [state, setState] = useState<GardenState>(loadGarden)

  useEffect(() => {
    saveGarden(state)
  }, [state])

  const addPlant = useCallback((plant: Omit<Plant, 'id'>) => {
    const newPlant: Plant = { ...plant, id: uuidv4() }
    setState(s => ({ ...s, plants: [...s.plants, newPlant] }))
    return newPlant
  }, [])

  const updatePlant = useCallback((id: string, updates: Partial<Plant>) => {
    setState(s => ({
      ...s,
      plants: s.plants.map(p => p.id === id ? { ...p, ...updates } : p),
    }))
  }, [])

  const removePlant = useCallback((id: string) => {
    setState(s => ({
      plants: s.plants.filter(p => p.id !== id),
      placedPlants: s.placedPlants.filter(pp => pp.plantId !== id),
    }))
  }, [])

  const placePlant = useCallback((plantId: string, x: number, y: number) => {
    const placed: PlacedPlant = { id: uuidv4(), plantId, x, y }
    setState(s => ({ ...s, placedPlants: [...s.placedPlants, placed] }))
    return placed
  }, [])

  const movePlacedPlant = useCallback((id: string, x: number, y: number) => {
    setState(s => ({
      ...s,
      placedPlants: s.placedPlants.map(pp => pp.id === id ? { ...pp, x, y } : pp),
    }))
  }, [])

  const removePlacedPlant = useCallback((id: string) => {
    setState(s => ({
      ...s,
      placedPlants: s.placedPlants.filter(pp => pp.id !== id),
    }))
  }, [])

  return {
    plants: state.plants,
    placedPlants: state.placedPlants,
    addPlant,
    updatePlant,
    removePlant,
    placePlant,
    movePlacedPlant,
    removePlacedPlant,
  }
}
