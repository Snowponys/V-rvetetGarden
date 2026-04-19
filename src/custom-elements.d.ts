import type React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      'md-filter-chip': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string
          selected?: boolean
        },
        HTMLElement
      >
      'md-outlined-text-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string
          type?: string
          rows?: number
          value?: string
          placeholder?: string
        },
        HTMLElement
      >
    }
  }
}

export {}
