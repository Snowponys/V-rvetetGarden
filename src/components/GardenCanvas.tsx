import { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Circle, Group, Text, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import useImage from 'use-image'
import type { Plant, PlacedPlant, PlantCategory } from '../types'
import { CATEGORY_COLOR } from '../utils/plantIcons'

const CATEGORY_ICON: Record<PlantCategory, string> = {
  träd: 'park',
  buske: 'grass',
  perenn: 'local_florist',
  lökväxt: 'psychiatry',
}

const PLANT_RADIUS = 12
const ICON_SIZE = 14

interface Props {
  plants: Plant[]
  placedPlants: PlacedPlant[]
  selectedPlacedId: string | null
  activeFilter: PlantCategory[]
  onSelectPlaced: (id: string | null) => void
  onMovePlaced: (id: string, x: number, y: number) => void
  onDropPlant: (plantId: string, x: number, y: number) => void
  onCategoryDrop: (pending: { x: number; y: number; categoryHint: string }) => void
  zoom: number
}

function matchesFilter(category: PlantCategory, filter: PlantCategory[]): boolean {
  if (filter.length === 0) return true
  return filter.includes(category)
}

export function GardenCanvas({
  plants,
  placedPlants,
  selectedPlacedId,
  activeFilter,
  onSelectPlaced,
  onMovePlaced,
  onDropPlant,
  onCategoryDrop,
  zoom,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({ w: 1024, h: 768 })
  const [isDraggingStage, setIsDraggingStage] = useState(false)
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  const centeredRef = useRef(false)

  const [blueprint] = useImage('/blueprint/Garden_blueprint.svg')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clampPos = useCallback(
    (x: number, y: number) => {
      if (!blueprint) return { x, y }
      const margin = 100
      const bw = blueprint.naturalWidth * zoom
      const bh = blueprint.naturalHeight * zoom
      return {
        x: Math.min(stageSize.w - margin, Math.max(margin - bw, x)),
        y: Math.min(stageSize.h - margin, Math.max(margin - bh, y)),
      }
    },
    [blueprint, zoom, stageSize],
  )

  // Center viewport on blueprint once it loads
  useEffect(() => {
    if (blueprint && !centeredRef.current && stageSize.w > 0) {
      centeredRef.current = true
      setStagePos({
        x: (stageSize.w - blueprint.naturalWidth) / 2,
        y: (stageSize.h - blueprint.naturalHeight) / 2,
      })
    }
  }, [blueprint, stageSize])

  const getCanvasPos = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      return {
        x: (clientX - rect.left - stagePos.x) / zoom,
        y: (clientY - rect.top - stagePos.y) / zoom,
      }
    },
    [stagePos, zoom],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const plantId = e.dataTransfer.getData('plantId')
    const categoryHint = e.dataTransfer.getData('categoryHint')
    const pos = getCanvasPos(e.clientX, e.clientY)
    if (plantId) onDropPlant(plantId, pos.x, pos.y)
    else if (categoryHint) onCategoryDrop({ ...pos, categoryHint })
  }

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target === e.target.getStage()) {
      setIsDraggingStage(true)
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }

  function handleStageMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!isDraggingStage || !lastPointer.current) return
    const dx = e.evt.clientX - lastPointer.current.x
    const dy = e.evt.clientY - lastPointer.current.y
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
    setStagePos(p => clampPos(p.x + dx, p.y + dy))
  }

  function handleStageMouseUp() {
    setIsDraggingStage(false)
    lastPointer.current = null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[#f1efec]"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={stageSize.w}
        height={stageSize.h}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={e => { if (e.target === e.target.getStage()) onSelectPlaced(null) }}
      >
        <Layer>
          {blueprint && (
            <KonvaImage
              image={blueprint}
              x={0}
              y={0}
              width={blueprint.naturalWidth}
              height={blueprint.naturalHeight}
              listening={false}
            />
          )}
          {placedPlants.map(pp => {
            const plant = plants.find(p => p.id === pp.plantId)
            if (!plant) return null
            const dimmed = !matchesFilter(plant.category, activeFilter)
            return (
              <PlantNode
                key={pp.id}
                placed={pp}
                plant={plant}
                selected={selectedPlacedId === pp.id}
                dimmed={dimmed}
                onSelect={() => onSelectPlaced(pp.id)}
                onMove={(x, y) => onMovePlaced(pp.id, x, y)}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}

function PlantNode({
  placed,
  plant,
  selected,
  dimmed,
  onSelect,
  onMove,
}: {
  placed: PlacedPlant
  plant: Plant
  selected: boolean
  dimmed: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
}) {
  return (
    <Group
      x={placed.x}
      y={placed.y}
      draggable
      opacity={dimmed ? 0.2 : 1}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={e => onMove(e.target.x(), e.target.y())}
    >
      {selected && (
        <Circle
          radius={PLANT_RADIUS + 5}
          stroke={CATEGORY_COLOR[plant.category]}
          strokeWidth={2.5}
          dash={[6, 4]}
        />
      )}
      <Circle
        radius={PLANT_RADIUS}
        fill="white"
        shadowBlur={selected ? 12 : 6}
        shadowOpacity={0.15}
        shadowColor="#000"
      />
      <Text
        text={CATEGORY_ICON[plant.category]}
        fontFamily="Material Symbols Rounded"
        fontSize={ICON_SIZE + 2}
        fill={CATEGORY_COLOR[plant.category]}
        x={-PLANT_RADIUS}
        y={-PLANT_RADIUS}
        width={PLANT_RADIUS * 2}
        height={PLANT_RADIUS * 2}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  )
}
