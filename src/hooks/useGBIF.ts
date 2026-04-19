export async function validatePlantInGBIF(scientificName: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ name: scientificName, limit: '1' })
    const res = await fetch(`https://api.gbif.org/v1/species/match?${params}`)
    if (!res.ok) return false
    const data = await res.json() as { matchType?: string; kingdom?: string }
    return data.matchType !== 'NONE' && data.kingdom === 'Plantae'
  } catch {
    return false
  }
}
