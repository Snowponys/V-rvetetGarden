import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '@material/web/textfield/outlined-text-field.js'
import type { Plant, PlacedPlant } from '../types'
import { CATEGORY_LABEL } from '../utils/plantIcons'

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'md-outlined-text-field': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement> & {
          label?: string
          type?: string
          rows?: number
          value?: string
          placeholder?: string
        },
        HTMLElement
      >
    }
  }
}


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
          className="fixed right-4 top-4 bottom-4 w-80 bg-[#F7FBF1] rounded-[24px] shadow-2xl flex flex-col z-40 overflow-hidden"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* Image header */}
          <div className="relative h-48 bg-[#d4e8c2] shrink-0">
            {plant.wikiImage ? (
              <img src={plant.wikiImage} alt={plant.commonName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🌿</div>
            )}
            <span className="absolute top-3 left-3 text-xs bg-white/80 backdrop-blur text-[#1d5200] px-2 py-0.5 rounded-full font-medium shadow-sm">
              {CATEGORY_LABEL[plant.category]}
            </span>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
            >
              <span className="material-symbols-rounded text-[#1d5200] text-base leading-none select-none">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
            {/* Name */}
            <div>
              <h3 className="text-xl font-semibold text-[#1d5200]">{capitalize(plant.commonName)}</h3>
              <p className="text-sm text-[#5ea143] italic">{plant.scientificName}</p>
            </div>

            {/* Loading state */}
            {!plant.facts && (
              <div className="flex items-center gap-2 text-[#5ea143] text-sm py-2">
                <span className="material-symbols-rounded text-base leading-none shrink-0 animate-spin">progress_activity</span>
                <span>Hämtar växtinformation…</span>
              </div>
            )}

            {plant.facts && (
              <>
                {/* Facts */}
                <div>
                  <span className="text-sm font-semibold text-[#1d5200] block mb-1">Växtfakta</span>
                  <div className="text-sm divide-y divide-[#dde3d7]">
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#5ea143]">Höjd</span>
                      <span className="text-[#1d5200]">{plant.facts.height}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#5ea143]">Bredd</span>
                      <span className="text-[#1d5200]">{plant.facts.spread}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#5ea143]">Ljus</span>
                      <span className="text-[#1d5200]">{plant.facts.sunlight}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#5ea143]">Blommar</span>
                      <span className="text-[#1d5200]">{plant.facts.bloomTime}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#5ea143]">Torktålighet</span>
                      <span className="text-[#1d5200] capitalize">{plant.facts.drought}</span>
                    </div>
                  </div>
                </div>

                {/* Care advice */}
                {plant.facts.careAdvice && (
                  <div>
                    <span className="text-sm font-semibold text-[#1d5200] block mb-2">Skötselråd</span>
                    <p className="text-sm text-[#1d5200] leading-relaxed opacity-80">
                      {plant.facts.careAdvice.slice(0, 300)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Notes — only for placed plants */}
            {placedPlant && <md-outlined-text-field
              key={placedPlant.id}
              label="Egna anteckningar"
              type="textarea"
              rows={3}
              value={notes}
              placeholder="Lägg till noteringar…"
              style={{ width: '100%', marginTop: '8px' }}
              onInput={(e: React.SyntheticEvent) => setNotes((e.target as HTMLInputElement).value)}
              onBlur={handleNotesBlur}
            />}
          </div>

          {placedPlant && (
            <div className="p-4 border-t border-[#c4c9bf]">
              <button
                onClick={() => { onRemovePlaced(placedPlant.id); onClose() }}
                className="w-full flex items-center justify-center py-2.5 rounded-full bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ff5449] text-sm font-medium transition-colors"
              >
                Ta bort från ritningen
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
