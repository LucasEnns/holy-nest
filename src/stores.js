// tool library
// missing pass max CUT_TO_DEPTH
// missing angle

import { localStore } from './localStore.js'
import { sessionStore } from './sessionStore.js'
import { cncLibrary } from './cncLibrary.js'

const defaultSettings = {
  version1: 'update key',
  language:
    navigator.language.slice(0, 2) ||
    navigator.userLanguage.slice(0, 2) ||
    'en',
  material: {
    width: 49,
    height: 97,
    thickness: 0.75,
    margins: 0.3,
    cut_depth: 0.75,
  },
  nestTypeColumn: false,
  nestOrder: 'widest',
  nestDirectionBottom: true,
  units: false,
  tool: 9,
  cnc: cncLibrary,
  show: true,
  activePanel: '',
}

export const csvTemplate = {
  en: [
    ['Project', 'New', 'Material', 'Plywood', ''],
    ['Borders', 'Top', 'Right', 'Bottom', 'Left'],
    [0, 0, 0, 0, 0],
    ['Metric?', false],
    ['Panel', 'Quantity', 'Width', 'Height'],
    [1, 0, 0, 0],
  ],
  fr: [
    ['Projét', 'Nouveau', 'Matèriaux', 'Plaquage', 'Modèle Portes', ''],
    ['Borders', 'Top', 'Right', 'Bottom', 'Left'],
    [0, 0, 0, 0, 0],
    ['Metric?', false],
    ['Panneaux', 'Quantité', 'Largeur', 'Hauteur'],
    [1, 0, 0, 0],
    ,
  ],
}

const defaultData = {
  name: '',
  sheets: [],
  errors: [],
  csv: {
    new: { ...csvTemplate },
    contents: [...csvTemplate.en],
    panels: [],
    headerRows: 5,
    output: '',
  },
  svg: '',
  cnc: '',
}

export const settings = localStore('settings', defaultSettings)
export const data = sessionStore('data', defaultData)
// export const sheets = sessionStore('sheets', [])
// export const CSV = sessionStore('csv-file', csvTemplate)
// export const svg = sessionStore('svg', '')
