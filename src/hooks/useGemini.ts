import { GoogleGenAI } from '@google/genai'
import type { PlantCategory, PlantFacts } from '../types'

function getClient() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY saknas')
  return new GoogleGenAI({ apiKey: key })
}

export function guessCategoryFromHint(hint: string): PlantCategory {
  if (hint === 'perenn') return 'perenn'
  if (hint === 'lökväxt') return 'lökväxt'
  if (hint === 'buske') return 'buske'
  return 'träd'
}

export interface PlantSuggestion {
  commonName: string
  scientificName: string
  category: PlantCategory
}

export async function generatePlantFacts(
  commonName: string,
  scientificName: string,
): Promise<PlantFacts> {
  const ai = getClient()
  const prompt = `Du är en botanisk expert med djup kunskap om trädgårdsväxter i Sverige.

Ta dig tid att tänka igenom varje svar noggrant för "${commonName}" (${scientificName}).
Verifiera varje uppgift mot din kunskap innan du svarar — ange inte osäkra värden.

Svara ENBART med giltig JSON (ingen markdown, inga backticks):
{
  "drought": "<låg|medel|hög>",
  "bloomTime": "<en månad eller ett månadsintervall på svenska med stor bokstav, t.ex. 'Maj' eller 'Juni–juli'. Inga andra typer av text.>",
  "sunlight": "<sol|halvskugga|skugga>",
  "height": "<typisk höjd som ett värde eller intervall, t.ex. '3–5 m'>",
  "spread": "<typisk bredd som ett värde eller intervall, t.ex. '2–3 m'>",
  "careAdvice": "<max 300 tecken om skötsel på svenska: beskär, vattna, gödsla, övervintring>"
}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.2 },
  })
  const text = response.text ?? ''
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('Kunde inte hämta växtfakta')
  return JSON.parse(match[0]) as PlantFacts
}
