interface WikiResult {
  description?: string
  image?: string
}

async function queryWiki(lang: string, title: string): Promise<WikiResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'extracts|pageimages',
    exintro: '1',
    explaintext: '1',
    piprop: 'original|thumbnail',
    pithumbsize: '600',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  const pages = data.query?.pages ?? {}
  const page = Object.values(pages)[0] as Record<string, unknown>
  if (!page || page.missing !== undefined) return null

  const original = (page.original as { source?: string } | undefined)?.source
  const thumb = (page.thumbnail as { source?: string } | undefined)?.source
  return {
    description: (page.extract as string | undefined)?.split('\n').find(l => l.trim().length > 30),
    image: original ?? thumb,
  }
}

export async function fetchWikipediaData(
  scientificName: string,
  commonName: string,
): Promise<WikiResult> {
  // Try Swedish first, English as fallback — both with scientific and common name
  const attempts: [string, string][] = [
    ['sv', scientificName],
    ['sv', commonName],
    ['en', scientificName],
    ['en', commonName],
  ]

  let description: string | undefined
  let image: string | undefined

  for (const [lang, title] of attempts) {
    if (description && image) break
    const result = await queryWiki(lang, title)
    if (!result) continue
    if (!description && result.description) description = result.description
    if (!image && result.image) image = result.image
  }

  return { description, image }
}
