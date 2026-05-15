import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant, PlantCategory } from '../types'
import { guessCategoryFromHint } from '../hooks/useGemini'
import { searchINaturalist, type INatSuggestion } from '../hooks/useINaturalist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  categoryHint: string
  onClose: () => void
  onPlantReady: (plant: Omit<Plant, 'id'>) => void
}

export function CanvasSearch({ open, categoryHint, onClose, onPlantReady }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<INatSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSuggestions([])
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setSearching(false)
      setError(null)
      return
    }
    setSearching(true)
    setSuggestions([])
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchINaturalist(query)
        setSuggestions(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sökning misslyckades')
      } finally {
        setSearching(false)
      }
    }, 250)
  }, [query])

  function handleSelect(s: INatSuggestion) {
    onPlantReady({
      commonName: s.commonName,
      scientificName: s.scientificName,
      category: guessCategoryFromHint(categoryHint) as PlantCategory,
      wikiImage: s.photoUrl,
    })
    onClose()
  }

  const placeholder =
    categoryHint === 'träd' ? 'Sök träd…' :
    categoryHint === 'buske' ? 'Sök buske…' :
    categoryHint === 'perenn' ? 'Sök perenn…' :
    'Sök lökväxt…'

  const showCard = query.length >= 2

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl px-4 flex flex-col gap-3"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          >
            {/* Search bar */}
            <div className="bg-background rounded-full shadow-lg border border-border flex items-center gap-3 px-5 py-4">
              <span className="material-symbols-rounded text-ring text-xl leading-none shrink-0 select-none">search</span>
              <Input
                ref={inputRef}
                className="flex-1 h-auto border-none bg-transparent p-0 text-lg text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && onClose()}
              />
              {searching && <span className="material-symbols-rounded text-ring text-lg leading-none shrink-0 animate-spin select-none">progress_activity</span>}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full w-8 h-8 shrink-0 hover:bg-secondary"
              >
                <span className="material-symbols-rounded text-ring text-base leading-none select-none">close</span>
              </Button>
            </div>

            {/* Results card */}
            <AnimatePresence>
              {showCard && (
                <motion.div
                  className="bg-background rounded-[20px] shadow-lg border border-border overflow-hidden"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {searching ? (
                    <div className="flex items-center justify-center gap-3 py-6 text-ring">
                      <span className="material-symbols-rounded text-lg leading-none animate-spin select-none">progress_activity</span>
                      <span className="text-sm">Söker växter…</span>
                    </div>
                  ) : error ? (
                    <div className="px-6 py-5 text-sm text-destructive">{error}</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="w-full flex items-center gap-4 px-4 py-3 h-auto justify-start border-b border-border last:border-0 hover:bg-accent rounded-none"
                        onClick={() => handleSelect(s)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary shrink-0 overflow-hidden">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt={s.commonName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-foreground text-base font-medium truncate">{s.commonName}</div>
                          <div className="text-xs text-muted-foreground italic truncate">{s.scientificName}</div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="px-6 py-5 text-sm text-muted-foreground">Inga träffar — försök med ett annat namn.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
