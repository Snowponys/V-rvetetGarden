interface Props {
  zoom: number
  onZoom: (delta: number) => void
}

export function ZoomControls({ zoom, onZoom }: Props) {
  return (
    <div className="fixed bottom-5 right-6 flex items-center gap-2 bg-[#f1efec]/90 backdrop-blur-md rounded-full shadow-xl border border-[#c4c9bf] px-3 py-2 z-30">
      <button
        onClick={() => onZoom(-0.1)}
        className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[#d4e8c2] transition-colors"
      >
        <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">zoom_out</span>
      </button>
      <button
        onClick={() => onZoom(1 - zoom)}
        className="text-sm font-medium text-[#1d5200] w-14 text-center hover:text-[#5ea143] transition-colors"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={() => onZoom(0.1)}
        className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[#d4e8c2] transition-colors"
      >
        <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none select-none">zoom_in</span>
      </button>
    </div>
  )
}
