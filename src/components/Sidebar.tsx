import '@material/web/chips/chip-set.js'
import '@material/web/chips/filter-chip.js'
import type { Plant, PlantCategory } from '../types'
import { CATEGORY_LABEL, ALL_CATEGORIES } from '../utils/plantIcons'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      'md-filter-chip': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { label?: string; selected?: boolean },
        HTMLElement
      >
    }
  }
}

interface Props {
  plants: Plant[]
  activeFilter: PlantCategory[]
  onFilterChange: (cat: PlantCategory) => void
  onRemovePlant: (id: string) => void
  onDragPlantId: (plantId: string) => void
}

export function Sidebar({ plants, activeFilter, onFilterChange, onRemovePlant, onDragPlantId }: Props) {
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
    <aside className="w-64 h-full bg-[#e6e9e3] flex flex-col shrink-0 border-r border-[#c4c9bf]">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#1d5200]">Vårvetet</h1>
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
                    onRemove={() => onRemovePlant(plant.id)}
                    onDragStart={() => onDragPlantId(plant.id)}
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
  onRemove,
  onDragStart,
}: {
  plant: Plant
  onRemove: () => void
  onDragStart: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#d4e8c2] cursor-grab active:cursor-grabbing group transition-colors"
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('plantId', plant.id)
        onDragStart()
      }}
    >
      <span className="flex-1 text-sm text-[#1d5200] font-medium truncate">{plant.commonName.charAt(0).toUpperCase() + plant.commonName.slice(1)}</span>
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full hover:bg-[#dde3d7] flex items-center justify-center"
      >
        <span className="material-symbols-rounded text-[#5ea143] text-base leading-none select-none">delete</span>
      </button>
    </div>
  )
}
