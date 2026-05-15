import { Button } from '@/components/ui/button'

interface Props {
  zoom: number
  onZoom: (delta: number) => void
}

export function ZoomControls({ zoom, onZoom }: Props) {
  return (
    <div className="fixed bottom-5 right-6 flex items-center gap-1 bg-background/90 backdrop-blur-md rounded-full shadow-xl border border-border px-3 py-2 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => onZoom(-0.1)}
      >
        <span className="material-symbols-rounded text-foreground text-xl leading-none select-none">zoom_out</span>
      </Button>
      <Button
        variant="ghost"
        className="text-sm font-medium w-14 text-center h-auto px-2 py-1"
        onClick={() => onZoom(1 - zoom)}
      >
        {Math.round(zoom * 100)}%
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => onZoom(0.1)}
      >
        <span className="material-symbols-rounded text-foreground text-xl leading-none select-none">zoom_in</span>
      </Button>
    </div>
  )
}
