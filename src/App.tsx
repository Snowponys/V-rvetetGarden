import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGardenStore } from './hooks/useGardenStore'
import { generatePlantFacts } from './hooks/useGemini'
import { fetchWikipediaData } from './hooks/useWikipedia'
import { Sidebar } from './components/Sidebar'
import { GardenCanvas } from './components/GardenCanvas'
import { CanvasSearch } from './components/CanvasSearch'
import { PlantDetailPanel } from './components/PlantDetailPanel'
import { ZoomControls } from './components/ZoomControls'
import { BottomCategoryBar } from './components/BottomCategoryBar'
import type { Plant, PlantCategory } from './types'

interface PendingDrop {
  x: number
  y: number
  categoryHint: string
}

export default function App() {
  const {
    plants,
    placedPlants,
    addPlant,
    updatePlant,
    removePlant,
    removePlacedPlant,
    placePlant,
    movePlacedPlant,
  } = useGardenStore()

  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)
  const [selectedCatalogPlantId, setSelectedCatalogPlantId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState<PlantCategory[]>([])

  const handleFilterChange = useCallback((cat: PlantCategory) => {
    setActiveFilter(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
    )
  }, [])

  const selectedPlaced = placedPlants.find(pp => pp.id === selectedPlacedId) ?? null
  const selectedPlant = selectedPlaced
    ? (plants.find(p => p.id === selectedPlaced.plantId) ?? null)
    : (plants.find(p => p.id === selectedCatalogPlantId) ?? null)

  const handleSelectPlaced = useCallback((id: string | null) => {
    setSelectedPlacedId(id)
    setSelectedCatalogPlantId(null)
  }, [])

  const handleSelectCatalogPlant = useCallback((plantId: string) => {
    setSelectedCatalogPlantId(plantId)
    setSelectedPlacedId(null)
  }, [])

  const handleCategoryDrop = useCallback((pending: PendingDrop) => {
    setPendingDrop(pending)
  }, [])

  const handleDropPlant = useCallback(
    (plantId: string, x: number, y: number) => {
      const placed = placePlant(plantId, x, y)
      setSelectedPlacedId(placed.id)
      setSelectedCatalogPlantId(null)
    },
    [placePlant],
  )

  const handlePlantReady = useCallback(
    (plant: Omit<Plant, 'id'>) => {
      if (!pendingDrop) return
      const newPlant = addPlant(plant)
      const placed = placePlant(newPlant.id, pendingDrop.x, pendingDrop.y)
      setSelectedPlacedId(placed.id)
      setSelectedCatalogPlantId(null)
      setPendingDrop(null)

      Promise.all([
        fetchWikipediaData(plant.scientificName ?? '', plant.commonName),
        generatePlantFacts(plant.commonName, plant.scientificName ?? ''),
      ]).then(([wiki, facts]) => {
        updatePlant(newPlant.id, {
          wikiImage: plant.wikiImage ?? wiki.image,
          facts,
        })
      }).catch(() => {})
    },
    [pendingDrop, addPlant, placePlant, updatePlant],
  )

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.min(3, Math.max(0.5, +(z + delta).toFixed(2))))
  }, [])

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#f1efec]">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="overflow-hidden shrink-0 h-full"
          >
            <Sidebar
              plants={plants}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              onRemovePlant={removePlant}
              onSelectPlant={handleSelectCatalogPlant}
              onDragPlantId={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative overflow-hidden">
        <GardenCanvas
          plants={plants}
          placedPlants={placedPlants}
          selectedPlacedId={selectedPlacedId}
          activeFilter={activeFilter}
          onSelectPlaced={handleSelectPlaced}
          onMovePlaced={movePlacedPlant}
          onDropPlant={handleDropPlant}
          onCategoryDrop={handleCategoryDrop}
          zoom={zoom}
        />

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-[#c4c9bf] shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>

        <ZoomControls zoom={zoom} onZoom={handleZoom} />
        <BottomCategoryBar />
      </main>

      <CanvasSearch
        open={pendingDrop !== null}
        categoryHint={pendingDrop?.categoryHint ?? ''}
        onClose={() => setPendingDrop(null)}
        onPlantReady={handlePlantReady}
      />

      <PlantDetailPanel
        plant={selectedPlant}
        placedPlant={selectedPlaced}
        onClose={() => { setSelectedPlacedId(null); setSelectedCatalogPlantId(null) }}
        onUpdate={updatePlant}
        onRemovePlaced={id => {
          removePlacedPlant(id)
          setSelectedPlacedId(null)
        }}
      />
    </div>
  )
}
