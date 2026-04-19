export {}

type DHTML<E extends import('react').HTMLAttributes<HTMLElement>> =
  import('react').DetailedHTMLProps<E, HTMLElement>

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': DHTML<import('react').HTMLAttributes<HTMLElement>>
      'md-filter-chip': DHTML<
        import('react').HTMLAttributes<HTMLElement> & {
          label?: string
          selected?: boolean
        }
      >
      'md-outlined-text-field': DHTML<
        import('react').HTMLAttributes<HTMLElement> & {
          label?: string
          type?: string
          rows?: number
          value?: string
          placeholder?: string
        }
      >
    }
  }
}
