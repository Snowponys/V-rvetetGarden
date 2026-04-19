import '@material/web/chips/chip-set.js'
import '@material/web/chips/filter-chip.js'
import type { Plant, PlacedPlant, PlantCategory } from '../types'
import { CATEGORY_LABEL, ALL_CATEGORIES } from '../utils/plantIcons'

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': import('react').DetailedHTMLProps<import('react').HTMLAttributes<HTMLElement>, HTMLElement>
      'md-filter-chip': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement> & { label?: string; selected?: boolean },
        HTMLElement
      >
    }
  }
}

interface Props {
  plants: Plant[]
  placedPlants: PlacedPlant[]
  activeFilter: PlantCategory[]
  onFilterChange: (cat: PlantCategory) => void
  onSelectPlant: (plantId: string) => void
  onClose: () => void
  onDragPlantId: (plantId: string) => void
}

export function Sidebar({ plants, placedPlants, activeFilter, onFilterChange, onSelectPlant, onClose, onDragPlantId }: Props) {
  const filtered = activeFilter.length === 0
    ? plants
    : plants.filter(p => activeFilter.includes(p.category))

  const grouped = ALL_CATEGORIES.reduce<Record<PlantCategory, Plant[]>>(
    (acc, cat) => {
      acc[cat] = filtered.filter(p => p.category === cat)
      return acc
    },
    { träd: [], buske: [], perenn: [], lökväxt: [] },
  )

  const tabs: { id: PlantCategory; label: string }[] = [
    { id: 'träd', label: 'Träd' },
    { id: 'buske', label: 'Buskar' },
    { id: 'perenn', label: 'Perenner' },
    { id: 'lökväxt', label: 'Lökväxter' },
  ]

  return (
    <aside className="w-64 h-full bg-[#F7FBF1] flex flex-col shrink-0 rounded-tr-2xl rounded-br-2xl overflow-hidden" style={{ boxShadow: '3px 0 8px rgba(0,0,0,0.14)' }}>
      <div className="pl-6 pr-4 pt-4 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1d5200]">Vårvetet</h1>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#d4e8c2] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">menu_open</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="pl-6 pr-6 pb-3">
        <md-chip-set>
          {tabs.map(tab => (
            <md-filter-chip
              key={tab.id}
              label={tab.label}
              selected={activeFilter.includes(tab.id)}
              onClick={() => onFilterChange(tab.id)}
            />
          ))}
        </md-chip-set>
      </div>

      {/* Plant list */}
      <div className="flex-1 overflow-y-auto px-2 pb-6">
        <p className="text-sm text-[#1d5200] font-medium mb-3 mt-2 pl-4 pr-2">
          Trädgårdskatalog
        </p>

        {filtered.length === 0 && (
          <p className="text-sm text-[#8d9286] text-center py-8">
            Inga växter här än.<br />Dra ut en kategori!
          </p>
        )}

        {ALL_CATEGORIES.map(cat => {
          const group = grouped[cat]
          if (group.length === 0) return null
          return (
            <div key={cat} className="mb-4">
              <p className="text-sm text-[#5ea143] font-normal mb-2 pl-4 pr-2">{CATEGORY_LABEL[cat]}</p>
              <div className="flex flex-col gap-1">
                {group.map(plant => (
                  <PlantListItem
                    key={plant.id}
                    plant={plant}
                    count={placedPlants.filter(pp => pp.plantId === plant.id).length}
                    onDragStart={() => onDragPlantId(plant.id)}
                    onSelect={() => onSelectPlant(plant.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function PlantListItem({
  plant,
  count,
  onDragStart,
  onSelect,
}: {
  plant: Plant
  count: number
  onDragStart: () => void
  onSelect: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 pl-4 pr-2 min-h-[48px] rounded-xl hover:bg-[#d4e8c2] active:bg-[#b8d4a4] cursor-grab active:cursor-grabbing transition-colors"
      draggable
      onClick={onSelect}
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('plantId', plant.id)
        onDragStart()
      }}
    >
      <span className="flex-1 text-sm text-[#1d5200] font-medium truncate">
        {plant.commonName.charAt(0).toUpperCase() + plant.commonName.slice(1)}
      </span>
      {count > 0 && (
        <span className={`text-xs font-semibold text-[#5ea143] bg-[#d4e8c2] rounded-full h-5 flex items-center justify-center shrink-0 mr-2 ${count < 10 ? 'w-5' : 'px-2'}`}>
          {count}
        </span>
      )}
    </div>
  )
}
