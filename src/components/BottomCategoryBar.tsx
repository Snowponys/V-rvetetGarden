interface Category {
  hint: string
  label: string
  icon: string
  emoji: string
}

const CATEGORIES: Category[] = [
  { hint: 'träd', label: 'Träd', icon: 'park', emoji: '🌳' },
  { hint: 'buske', label: 'Buskar', icon: 'grass', emoji: '🌿' },
  { hint: 'perenn', label: 'Perenner', icon: 'local_florist', emoji: '🌸' },
  { hint: 'lökväxt', label: 'Lökväxter', icon: 'psychiatry', emoji: '🌷' },
]

function createDragGhost(label: string, icon: string): HTMLElement {
  const pill = document.createElement('div')
  pill.style.cssText = [
    'position:absolute',
    'top:-9999px',
    'left:-9999px',
    'display:inline-flex',
    'align-items:center',
    'gap:8px',
    'padding:8px 16px',
    'border-radius:9999px',
    "background:#F7FBF1",
    'border:1px solid #c4c9bf',
    "font-family:'Google Sans',system-ui,sans-serif",
    'font-size:14px',
    'font-weight:500',
    'color:#1d5200',
    'box-shadow:0 4px 16px rgba(0,0,0,0.18)',
    'white-space:nowrap',
  ].join(';')

  const iconEl = document.createElement('span')
  iconEl.className = 'material-symbols-rounded'
  iconEl.style.cssText = "font-size:20px;line-height:1;font-family:'Material Symbols Rounded'"
  iconEl.textContent = icon

  const textEl = document.createElement('span')
  textEl.textContent = label

  pill.appendChild(iconEl)
  pill.appendChild(textEl)
  return pill
}

export function BottomCategoryBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-5 pointer-events-none">
      <div className="flex items-center gap-2 bg-[#F7FBF1]/90 backdrop-blur-md rounded-full shadow-xl border border-[#c4c9bf] px-3 py-2 pointer-events-auto">
        {CATEGORIES.map(cat => (
          <div
            key={cat.hint}
            draggable
            onDragStart={(e: React.DragEvent) => {
              e.dataTransfer.setData('categoryHint', cat.hint)
              e.dataTransfer.setData('categoryEmoji', cat.emoji)

              const ghost = createDragGhost(cat.label, cat.icon)
              document.body.appendChild(ghost)
              e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2)
              requestAnimationFrame(() => document.body.removeChild(ghost))
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#d4e8c2] cursor-grab active:cursor-grabbing transition-colors select-none"
          >
            <span className="material-symbols-rounded text-[#1d5200] text-xl leading-none shrink-0">{cat.icon}</span>
            <span className="text-sm font-medium text-[#1d5200] whitespace-nowrap">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
