import type { PlantCategory } from '../types'

const emojiMap: Record<PlantCategory, string> = {
  träd: '🌳',
  buske: '🌳',
  perenn: '🌸',
  lökväxt: '🌷',
}

const cache: Partial<Record<PlantCategory, string>> = {}

export function getCategoryIconUrl(category: PlantCategory): string {
  if (cache[category]) return cache[category]!
  const emoji = emojiMap[category]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16">${emoji}</text></svg>`
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  cache[category] = url
  return url
}
