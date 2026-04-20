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

const CATEGORY_RADIUS: Partial<Record<PlantCategory, number>> = {
  träd: 24,
  buske: 24,
}
const CATEGORY_ICON_SIZE: Partial<Record<PlantCategory, number>> = {
  träd: 28,
  buske: 28,
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const WHEEL_SENSITIVITY = 0.006
const WHEEL_MAX_STEP = 0.15
const LERP = 0.22

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
  onZoomChange: (zoom: number) => void
}

function matchesFilter(category: PlantCategory, filter: PlantCategory[]): boolean {
  if (filter.length === 0) return true
  return filter.includes(category)
}

function tdist(t1: Touch, t2: Touch) {
  return Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2)
}

function tmid(t1: Touch, t2: Touch) {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
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
  onZoomChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({ w: 1024, h: 768 })
  const centeredRef = useRef(false)

  // ── Animation refs (always current, avoid stale-closure issues in RAF) ──
  const animZoom = useRef(zoom)
  const animPos = useRef({ x: 0, y: 0 })
  // Keep refs in sync with React state/props
  useEffect(() => { animZoom.current = zoom }, [zoom])
  const syncPos = useCallback((p: { x: number; y: number }) => {
    animPos.current = p
    setStagePos(p)
  }, [])

  // ── Wheel smooth animation ──
  const wheelTarget = useRef<{ zoom: number; pos: { x: number; y: number } } | null>(null)
  const rafId = useRef<number | null>(null)
  const isGestureZoom = useRef(false)

  function wheelStep() {
    const t = wheelTarget.current
    if (!t) return

    const cz = animZoom.current
    const cp = animPos.current
    const nz = cz + (t.zoom - cz) * LERP
    const nx = cp.x + (t.pos.x - cp.x) * LERP
    const ny = cp.y + (t.pos.y - cp.y) * LERP

    const settled =
      Math.abs(nz - t.zoom) < 0.0005 &&
      Math.abs(nx - t.pos.x) < 0.3 &&
      Math.abs(ny - t.pos.y) < 0.3

    if (settled) {
      animZoom.current = t.zoom
      animPos.current = t.pos
      setStagePos(t.pos)
      onZoomChange(t.zoom)
      wheelTarget.current = null
      isGestureZoom.current = false
      rafId.current = null
    } else {
      animZoom.current = nz
      syncPos({ x: nx, y: ny })
      onZoomChange(nz)
      rafId.current = requestAnimationFrame(wheelStep)
    }
  }

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current) }, [])

  // ── Touch panning (single finger) ──
  const panTouch = useRef<{ x: number; y: number } | null>(null)

  // ── Pinch zoom (two fingers) ──
  const pinch = useRef<{
    dist: number
    zoom: number
    pos: { x: number; y: number }
    mid: { x: number; y: number }
  } | null>(null)

  // ── Mouse panning ──
  const [isDragging, setIsDragging] = useState(false)
  const lastMouse = useRef<{ x: number; y: number } | null>(null)

  // ── Track previous zoom to detect ZoomControls changes ──
  const prevZoom = useRef(zoom)

  const [blueprint] = useImage('/blueprint/Garden_blueprint.svg')
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    document.fonts.load(`${ICON_SIZE + 2}px "Material Symbols Rounded"`)
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clamp = useCallback(
    (x: number, y: number, z?: number) => {
      if (!blueprint) return { x, y }
      const margin = 100
      const eff = z ?? zoom
      const bw = blueprint.naturalWidth * eff
      const bh = blueprint.naturalHeight * eff
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
      const p = {
        x: (stageSize.w - blueprint.naturalWidth) / 2,
        y: (stageSize.h - blueprint.naturalHeight) / 2,
      }
      animPos.current = p
      setStagePos(p)
    }
  }, [blueprint, stageSize])

  // When ZoomControls changes zoom (not gesture), zoom around viewport center
  useEffect(() => {
    const prev = prevZoom.current
    prevZoom.current = zoom
    if (Math.abs(zoom - prev) < 0.0001 || isGestureZoom.current) return
    const cx = stageSize.w / 2
    const cy = stageSize.h / 2
    const scale = zoom / prev
    const p = clamp(cx - (cx - animPos.current.x) * scale, cy - (cy - animPos.current.y) * scale, zoom)
    animPos.current = p
    setStagePos(p)
  }, [zoom]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Mouse pan ──
  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target === e.target.getStage()) {
      setIsDragging(true)
      lastMouse.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!isDragging || !lastMouse.current) return
    const dx = e.evt.clientX - lastMouse.current.x
    const dy = e.evt.clientY - lastMouse.current.y
    lastMouse.current = { x: e.evt.clientX, y: e.evt.clientY }
    const p = clamp(animPos.current.x + dx, animPos.current.y + dy)
    syncPos(p)
  }

  function handleMouseUp() {
    setIsDragging(false)
    lastMouse.current = null
  }

  // ── Wheel zoom (smooth) ──
  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    const raw = -e.evt.deltaY * WHEEL_SENSITIVITY
    const delta = Math.max(-WHEEL_MAX_STEP, Math.min(WHEEL_MAX_STEP, raw))

    const fromZoom = wheelTarget.current?.zoom ?? animZoom.current
    const fromPos = wheelTarget.current?.pos ?? animPos.current
    const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, fromZoom * (1 + delta)))
    if (newZoom === fromZoom) return

    const rect = containerRef.current!.getBoundingClientRect()
    const px = e.evt.clientX - rect.left
    const py = e.evt.clientY - rect.top
    const scale = newZoom / fromZoom
    const newPos = clamp(px - (px - fromPos.x) * scale, py - (py - fromPos.y) * scale, newZoom)

    isGestureZoom.current = true
    wheelTarget.current = { zoom: newZoom, pos: newPos }
    if (!rafId.current) rafId.current = requestAnimationFrame(wheelStep)
  }

  // ── Touch: single-finger pan + two-finger pinch ──
  function handleTouchStart(e: Konva.KonvaEventObject<TouchEvent>) {
    const touches = e.evt.touches
    if (touches.length === 1 && e.target === e.target.getStage()) {
      panTouch.current = { x: touches[0].clientX, y: touches[0].clientY }
    } else if (touches.length === 2) {
      e.evt.preventDefault()
      panTouch.current = null
      const [t1, t2] = [touches[0], touches[1]]
      const rect = containerRef.current!.getBoundingClientRect()
      const mid = tmid(t1, t2)
      isGestureZoom.current = true
      pinch.current = {
        dist: tdist(t1, t2),
        zoom: animZoom.current,
        pos: { ...animPos.current },
        mid: { x: mid.x - rect.left, y: mid.y - rect.top },
      }
    }
  }

  function handleTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const touches = e.evt.touches
    if (touches.length === 1 && panTouch.current) {
      const dx = touches[0].clientX - panTouch.current.x
      const dy = touches[0].clientY - panTouch.current.y
      panTouch.current = { x: touches[0].clientX, y: touches[0].clientY }
      const p = clamp(animPos.current.x + dx, animPos.current.y + dy)
      syncPos(p)
    } else if (touches.length === 2 && pinch.current) {
      e.evt.preventDefault()
      const [t1, t2] = [touches[0], touches[1]]
      const rect = containerRef.current!.getBoundingClientRect()
      const newDist = tdist(t1, t2)
      const rawMid = tmid(t1, t2)
      const newMid = { x: rawMid.x - rect.left, y: rawMid.y - rect.top }

      const { dist: prevDist, zoom: prevZoom, pos: prevPos, mid: prevMid } = pinch.current
      // Dampen scale to reduce over-sensitivity
      const rawScale = newDist / prevDist
      const scale = 1 + (rawScale - 1) * 0.85
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prevZoom * scale))

      // Simultaneous pan+zoom: new_pos = new_mid + (prev_pos - prev_mid) * scale
      const effectiveScale = newZoom / prevZoom
      const rawX = newMid.x + (prevPos.x - prevMid.x) * effectiveScale
      const rawY = newMid.y + (prevPos.y - prevMid.y) * effectiveScale
      const newPos = clamp(rawX, rawY, newZoom)

      animZoom.current = newZoom
      syncPos(newPos)
      onZoomChange(newZoom)
      pinch.current = { dist: newDist, zoom: newZoom, pos: newPos, mid: newMid }
    }
  }

  function handleTouchEnd(e: Konva.KonvaEventObject<TouchEvent>) {
    if (e.evt.touches.length === 0) panTouch.current = null
    if (e.evt.touches.length < 2) {
      pinch.current = null
      isGestureZoom.current = false
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[#FDFCF9]"
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
                fontReady={fontReady}
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
  fontReady,
  onSelect,
  onMove,
}: {
  placed: PlacedPlant
  plant: Plant
  selected: boolean
  dimmed: boolean
  fontReady: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
}) {
  const r = CATEGORY_RADIUS[plant.category] ?? PLANT_RADIUS
  const iconSize = CATEGORY_ICON_SIZE[plant.category] ?? ICON_SIZE

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
          radius={r + 5}
          stroke={CATEGORY_COLOR[plant.category]}
          strokeWidth={2.5}
          dash={[6, 4]}
        />
      )}
      <Circle
        radius={r}
        fill="white"
        shadowBlur={selected ? 12 : 6}
        shadowOpacity={0.15}
        shadowColor="#000"
      />
      {fontReady && (
        <Text
          text={CATEGORY_ICON[plant.category]}
          fontFamily="Material Symbols Rounded"
          fontSize={iconSize + 2}
          fill={CATEGORY_COLOR[plant.category]}
          x={-r}
          y={-r}
          width={r * 2}
          height={r * 2}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
    </Group>
  )
}
