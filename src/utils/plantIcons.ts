import type { PlantCategory } from '../types'

export const CATEGORY_EMOJI: Record<PlantCategory, string> = {
  träd: '🌳',
  buske: '🌿',
  perenn: '🌸',
  lökväxt: '🌷',
}

export const CATEGORY_LABEL: Record<PlantCategory, string> = {
  träd: 'Träd',
  buske: 'Buskar',
  perenn: 'Perenner',
  lökväxt: 'Lökväxter',
}

export const CATEGORY_COLOR: Record<PlantCategory, string> = {
  träd: '#1d5200',
  buske: '#5ea143',
  perenn: '#5ea143',
  lökväxt: '#00a1a5',
}

export const ALL_CATEGORIES: PlantCategory[] = ['träd', 'buske', 'perenn', 'lökväxt']
