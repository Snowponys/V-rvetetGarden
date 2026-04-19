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
    removePlacedPlant,
    placePlant,
    movePlacedPlant,
    updatePlacedPlant,
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
    <div className="h-screen w-screen overflow-hidden relative bg-[#F7FBF1]">
      {/* Canvas fills full viewport */}
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

      {/* Sidebar overlay */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            className="absolute top-0 left-0 h-full z-20"
            style={{ width: 256 }}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <Sidebar
              plants={plants}
              placedPlants={placedPlants}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              onSelectPlant={handleSelectCatalogPlant}
              onClose={() => setSidebarOpen(false)}
              onDragPlantId={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hamburger — only when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-[#c4c9bf] shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">menu</span>
        </button>
      )}

      <ZoomControls zoom={zoom} onZoom={handleZoom} />
      <BottomCategoryBar />

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
        onUpdatePlaced={updatePlacedPlant}
        onRemovePlaced={id => {
          removePlacedPlant(id)
          setSelectedPlacedId(null)
        }}
      />
    </div>
  )
}
