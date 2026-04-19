export type PlantCategory = 'träd' | 'buske' | 'perenn' | 'lökväxt'

export interface PlantFacts {
  drought: 'låg' | 'medel' | 'hög'
  bloomTime: string
  sunlight: string
  height: string
  spread: string
  careAdvice: string
}

export interface Plant {
  id: string
  commonName: string
  scientificName: string
  category: PlantCategory
  wikiImage?: string
  facts?: PlantFacts
  notes?: string
}

export interface PlacedPlant {
  id: string
  plantId: string
  x: number
  y: number
  rotation?: number
  notes?: string
}

export interface GardenState {
  plants: Plant[]
  placedPlants: PlacedPlant[]
}
