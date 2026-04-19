export interface INatSuggestion {
  id: number
  commonName: string
  scientificName: string
  photoUrl?: string
}

interface INatTaxon {
  id: number
  name: string
  preferred_common_name?: string
  rank: string
  default_photo?: { medium_url: string }
}

// taxon_id=47126 = Plantae kingdom on iNaturalist
export async function searchINaturalist(query: string): Promise<INatSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    rank: 'species,subspecies,variety',
    taxon_id: '47126',
    locale: 'sv',
    per_page: '10',
  })
  const res = await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?${params}`)
  if (!res.ok) return []
  const data = await res.json() as { results: INatTaxon[] }

  return data.results
    .filter(t => t.rank === 'species' || t.rank === 'subspecies' || t.rank === 'variety')
    .map(t => ({
      id: t.id,
      commonName: t.preferred_common_name ?? t.name,
      scientificName: t.name,
      photoUrl: t.default_photo?.medium_url,
    }))
    .slice(0, 10)
}
