import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant, PlacedPlant } from '../types'
import { CATEGORY_LABEL } from '../utils/plantIcons'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  plant: Plant | null
  placedPlant: PlacedPlant | null
  onClose: () => void
  onUpdatePlaced: (id: string, updates: Partial<PlacedPlant>) => void
  onRemovePlaced: (id: string) => void
}

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function PlantDetailPanel({ plant, placedPlant, onClose, onUpdatePlaced, onRemovePlaced }: Props) {
  const [notes, setNotes] = useState(placedPlant?.notes ?? '')

  useEffect(() => {
    setNotes(placedPlant?.notes ?? '')
  }, [placedPlant?.id])

  function handleNotesBlur() {
    if (placedPlant && notes !== placedPlant.notes) {
      onUpdatePlaced(placedPlant.id, { notes })
    }
  }

  return (
    <AnimatePresence>
      {plant && (
        <motion.div
          className="fixed right-4 top-4 bottom-4 w-80 bg-background rounded-[24px] shadow-2xl flex flex-col z-40 overflow-hidden"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* Image header */}
          <div className="relative h-48 bg-secondary shrink-0">
            {plant.wikiImage ? (
              <img src={plant.wikiImage} alt={plant.commonName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🌿</div>
            )}
            <span className="absolute top-3 left-3 text-xs bg-card/80 backdrop-blur text-foreground px-2 py-0.5 rounded-full font-medium shadow-sm">
              {CATEGORY_LABEL[plant.category]}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur hover:bg-card shadow"
            >
              <span className="material-symbols-rounded text-foreground text-base leading-none select-none">close</span>
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
            {/* Name */}
            <div>
              <h3 className="text-xl font-semibold text-foreground">{capitalize(plant.commonName)}</h3>
              <p className="text-sm text-ring italic">{plant.scientificName}</p>
            </div>

            {/* Loading state */}
            {!plant.facts && (
              <div className="flex items-center gap-2 text-ring text-sm py-2">
                <span className="material-symbols-rounded text-base leading-none shrink-0 animate-spin">progress_activity</span>
                <span>Hämtar växtinformation…</span>
              </div>
            )}

            {plant.facts && (
              <>
                {/* Facts */}
                <div>
                  <span className="text-sm font-semibold text-foreground block mb-1">Växtfakta</span>
                  <div className="text-sm divide-y divide-border">
                    <div className="flex justify-between py-2.5">
                      <span className="text-ring">Höjd</span>
                      <span className="text-foreground">{plant.facts.height}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-ring">Bredd</span>
                      <span className="text-foreground">{plant.facts.spread}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-ring">Ljus</span>
                      <span className="text-foreground">{plant.facts.sunlight}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-ring">Blommar</span>
                      <span className="text-foreground">{plant.facts.bloomTime}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-ring">Torktålighet</span>
                      <span className="text-foreground capitalize">{plant.facts.drought}</span>
                    </div>
                  </div>
                </div>

                {/* Care advice */}
                {plant.facts.careAdvice && (
                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-2">Skötselråd</span>
                    <p className="text-sm text-foreground leading-relaxed opacity-80">
                      {plant.facts.careAdvice.slice(0, 300)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Notes — only for placed plants */}
            {placedPlant && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">Egna anteckningar</span>
                <Textarea
                  key={placedPlant.id}
                  placeholder="Lägg till noteringar…"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          {placedPlant && (
            <div className="p-4 border-t border-border">
              <Button
                variant="destructive"
                className="w-full rounded-full"
                onClick={() => { onRemovePlaced(placedPlant.id); onClose() }}
              >
                Ta bort från ritningen
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
