// stores.js
// import { writable } from 'svelte/store'
import { localStore } from './localStore.js'

const fallback = [
  { sheet_width: 49, sheet_height: 97 }
]

// export const cabinets = localStore('cabinets', [])

// export const inputState = localStore('input-state', "cabinet")
// export const cabinetType = localStore('cabinet-type', "bathroom")

export const panels = localStore('panels', [])
export const sheets = localStore('sheets', [])
export const fileInfo = localStore('file-info', {})

// export const inputTemplate = localStore('template', template)
