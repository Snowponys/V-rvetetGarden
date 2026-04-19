import '@material/web/chips/chip-set.js'
import '@material/web/chips/filter-chip.js'
import type { Plant, PlantCategory } from '../types'
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
  activeFilter: PlantCategory[]
  onFilterChange: (cat: PlantCategory) => void
  onSelectPlant: (plantId: string) => void
  onClose: () => void
  onDragPlantId: (plantId: string) => void
}

export function Sidebar({ plants, activeFilter, onFilterChange, onSelectPlant, onClose, onDragPlantId }: Props) {
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
    <aside className="w-64 h-full bg-[#e6e9e3] flex flex-col shrink-0 rounded-tr-2xl rounded-br-2xl shadow-lg overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1d5200]">Vårvetet</h1>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#d4e8c2] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">menu_open</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3">
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
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="text-sm text-[#1d5200] font-semibold mb-3 mt-2">
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
              <p className="text-sm text-[#5ea143] font-medium mb-2">{CATEGORY_LABEL[cat]}</p>
              <div className="flex flex-col gap-1">
                {group.map(plant => (
                  <PlantListItem
                    key={plant.id}
                    plant={plant}
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
  onDragStart,
  onSelect,
}: {
  plant: Plant
  onDragStart: () => void
  onSelect: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#d4e8c2] cursor-grab active:cursor-grabbing transition-colors"
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
    </div>
  )
}
