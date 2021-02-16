import { localStore } from './localStore.js'
import { sessionStore } from './sessionStore.js'
import { cncLibrary } from './cncLibrary.js'

function setLanguage() {
  let lang =
    navigator.language.slice(0, 2) || navigator.userLanguage.slice(0, 2)
  if (lang.slice(0, 2) === 'fr') return 'fr'
  return 'en'
}

const defaultSettings = {
  beta1: '< update key to update settings',
  language: setLanguage(),
  material: {
    width: 49,
    height: 97,
    thickness: 0.75,
    margins: 0.3,
  },
  nestTypeColumn: false,
  nestOrder: 'widest',
  nestDirectionBottom: true,
  units: false,
  tools: { profile: 9, engraver: 3, tool: 1 },
  cnc: cncLibrary,
  subsettings: {
    show: true,
    project: true,
    profile: false,
    engraver: false,
    library: false,
    sheet: false,
    nest: true,
  },
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
  tools: {
    engraver: {
      tool: 3,
      engrave: false,
      cut_depth: 0.005,
      xStart: 1,
      yStart: 1,
      size: 0.3,
      spacing: 0.1,
      direction: 'ltr',
    },
    profile: { tool: 9, cut_depth: 0.75, link: 0.02, min_size: 12 },
  },
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
