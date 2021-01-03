// stores.js
// import { writable } from 'svelte/store'

// tool library
// missing pass max CUT_TO_DEPTH
// missing angle

import { localStore } from './localStore.js'
import { sessionStore } from './sessionStore.js'
import { formatDate } from './methods.js'

let placementSettings = {
  material: {
    type: '',
    colour: '',
    width: 49,
    height: 97,
    thickness: 0.75,
    margins: 0.3,
  },
  tool: 9,
  nestTypeColumn: false,
  nestOrder: 'widest',
  nestDirectionBottom: true,
  units: false,
  show: true,
  cnc: {
    1: {
      type: 'Endmill',
      diameter: 0.1875,
      spindle: 18000,
      feed: 75,
      plunge: 75,
      ramp: 1,
      max_depth: 0.125,
    },
    2: {
      type: 'Endmill',
      diameter: 0.75,
      spindle: 18000,
      feed: 150,
      plunge: 40,
      ramp: 3,
      max_depth: 3,
    },
    3: {
      type: 'Ballnose',
      diameter: 0.125,
      spindle: 18000,
      feed: 150,
      plunge: 40,
      ramp: 1,
      max_depth: 0.125,
    },
    4: {
      type: 'Edger',
      diameter: 0.75,
      spindle: 18000,
      feed: 100,
      plunge: 40,
      ramp: 2.25,
      max_depth: 2.25,
    },
    5: {
      type: 'drill',
      diameter: 0.19685,
      spindle: 18000,
      feed: 0,
      plunge: 70,
      ramp: 0,
      max_depth: 1,
    },
    6: {
      type: 'Endmill',
      diameter: 0.25,
      spindle: 18000,
      feed: 150,
      plunge: 40,
      ramp: 1,
      max_depth: 0.125,
    },
    7: {
      type: 'drill',
      diameter: 0.31496,
      spindle: 18000,
      feed: 0,
      plunge: 70,
      ramp: 0,
      max_depth: 1,
    },
    8: {
      type: 'surfacing',
      diameter: 2.5,
      spindle: 10000,
      feed: 75,
      plunge: 30,
      ramp: 8,
      max_depth: 0.125,
    },
    9: {
      type: 'Endmill',
      diameter: 0.375,
      spindle: 18000,
      feed: 400,
      plunge: 70,
      ramp: 1,
      max_depth: 0.875,
    },
    10: {
      type: 'Endmill',
      diameter: 0.375,
      spindle: 18000,
      feed: 400,
      plunge: 70,
      ramp: 1,
      max_depth: 0.875,
    },
    11: {
      type: 'drill',
      diameter: 0.3937,
      spindle: 18000,
      feed: 0,
      plunge: 70,
      ramp: 0,
      max_depth: 1,
    },
    12: {
      type: 'Vcarve',
      diameter: 1.5,
      spindle: 18000,
      feed: 75,
      plunge: 40,
      ramp: 1,
      max_depth: 0.75,
    },
  },
}
// const fallback = [
//   { sheet_width: 49, sheet_height: 97 }
// ]

export const blancCSV = {
  name: formatDate(new Date(), 'yymmdd-HM'),
  // name: formatDate( new Date(), 'yymmdd-HM' ),
  errors: [],
  contents: [
    ['Project name:', 'New'],
    ['Border (+ or -)', 0],
    ['Metric units', false],
    [, , ,],
    ['Panel', 'Q', 'W', 'H'],
    [1, , ,],
  ],
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
