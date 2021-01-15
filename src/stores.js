import { localStore } from './localStore.js'
import { sessionStore } from './sessionStore.js'
import { cncLibrary } from './cncLibrary.js'

const defaultSettings = {
  beta: '< update key to update settings',
  language: navigator.language.slice(0, 2) || navigator.userLanguage.slice(0, 2) || 'fr',
  material: {
    width: 49,
    height: 97,
    thickness: 0.75,
    margins: 0.3,
    cut_depth: 0.75,
    link: 0.02,
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
    ['Project', 'New', 'Material', 'Plywood', 'Project Info', 'doors'],
    ['Borders', 'Top', 'Right', 'Bottom', 'Left'],
    [0, 0, 0, 0, 0],
    ['Metric?', false],
    ['Panel', 'Quantity', 'Width', 'Height'],
    [1, 0, 0, 0],
  ],
  fr: [
    ['Projét', 'Nouveau', 'Matèriaux', 'Plaquage', 'Modèle Portes', ''],
    ['Borders', 'haut', 'droit', 'bas', 'gauche'],
    [0, 0, 0, 0, 0],
    ['Metric?', false],
    ['Panneaux', 'Quantité', 'Largeur', 'Hauteur'],
    [1, 0, 0, 0],
  ],
}

const defaultData = {
  name: '',
  sheets: [],
  errors: [],
  csv: {
    new: [...csvTemplate[defaultSettings.language]],
    contents: [...csvTemplate[defaultSettings.language]],
    panels: [],
    headerRows: 5,
    output: '',
  },
  svg: '',
  cnc: '',
}

export const settings = localStore('settings', defaultSettings)
export const data = sessionStore('data', defaultData)
