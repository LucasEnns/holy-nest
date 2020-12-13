// stores.js
// import { writable } from 'svelte/store'
import { localStore } from './localStore.js'
import { sessionStore } from './sessionStore.js'
import { formatDate } from "./methods.js";

let placementSettings = {

  material: {
    width: 49,
    height: 97,
    thickness: 0.75,
    margins: 0.125
  },
  cutter: 0.375,
  gap: 0,
  units: false
}
// const fallback = [
//   { sheet_width: 49, sheet_height: 97 }
// ]

export const blancCSV = {
  name: formatDate( new Date(), 'yymmdd-HM' ),
  errors: [],
  contents: [
    ['Project name:', 'New'],
    ['Border (+ or -)', 0],
    ['Metric units', false],
    [,,,],
    ['Panel','Q','W','H'],
    [1,,,]

  ]
}

// export const cabinets = localStore('cabinets', [])

// export const inputState = localStore('input-state', "cabinet")
// export const cabinetType = localStore('cabinet-type', "bathroom")

export const settings = localStore('settings', placementSettings)
export const panels = sessionStore('panels', [])
export const sheets = sessionStore('sheets', [])
export const csvFile = sessionStore('csv-file', blancCSV)
export const svg = sessionStore('svg', '')
export const activePanel = sessionStore('activePanel', '')

// export const inputTemplate = localStore('template', template)
