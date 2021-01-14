///////////////////////////////////////////////////////
// TO DO
//////////////////////////////////////////////////////

import { formatDate, cleanFloat } from './methods.js'

export function Gcode(data, settings) {
  // let Z_HOME = 0
  const SHEETS = data.sheets,
    TOOL_NUMBER = settings.tool,
    SPINDLE_SPEED = settings.cnc[TOOL_NUMBER].spindle,
    FEED_RATE = settings.cnc[TOOL_NUMBER].feed,
    PLUNGE_RATE = settings.cnc[TOOL_NUMBER].plunge,
    PLUNGE_DISTANCE = settings.cnc[TOOL_NUMBER].ramp,
    X_HOME = settings.material.width / 2 || 30.0,
    Y_HOME = Math.min(settings.material.height + 10, 122),
    SAFE_HEIGHT = settings.material.thickness + 0.25 || 2,
    MATERIAL_HEIGHT = settings.material.thickness,
    CUT_TO_DEPTH = cleanFloat(Math.max(MATERIAL_HEIGHT - settings.material.cut_depth, 0)),
    MAX_PASS_DEPTH = settings.cnc[TOOL_NUMBER].pass_depth,
    PRECUT_DEPTH = CUT_TO_DEPTH + settings.material.link,
    IS_FRENCH = settings.language.includes('fr')

  let output = [...HEADER(TOOL_NUMBER, SPINDLE_SPEED)]
  SHEETS.forEach((sheet) => {
    output.push(`( ${sheet.id} )`)
    sheet.columns.forEach((column, index) => {
      column.group
        .flat()
        .sort((a, b) =>
          settings.nestTypeColumn ? columnSort(a, b, index) : rowSort(a, b, index)
        )
        .forEach((panel) => output.push(profileCut(panel)))
    })
    output.push(SHEET_CHANGE())
  })

  output.pop() // get rid of last sheet change
  output.push(FOOTER())
  return output
    .flat()
    .flat()
    .filter((i) => i !== '')
    .join('\n')

  ///////////////////////////////////
  //    methods to write g-code
  //////////////////////////////////

  function profileCut(panel) {
    const x = cleanFloat(panel.x),
      y = cleanFloat(panel.y),
      x_ = cleanFloat(x + panel.width),
      y_ = cleanFloat(y + panel.height),
      yStart = cleanFloat(y_ - PLUNGE_DISTANCE)

    function pass() {
      const contour = (depth) => [
        PLUNGE_MOVE(x, y_, depth, PLUNGE_RATE),
        FEED(FEED_RATE),
        MOVE_X(x_),
        MOVE_Y(y),
        MOVE_X(x),
        MOVE_Y(yStart),
      ]

      if (!CUT_TO_DEPTH && (panel.width < 5 || panel.height < 5))
        return contour(PRECUT_DEPTH)

      if (MAX_PASS_DEPTH >= MATERIAL_HEIGHT) return ''

      let passes = [],
        nextPass = MATERIAL_HEIGHT - MAX_PASS_DEPTH
      while (nextPass > CUT_TO_DEPTH) {
        passes.push(contour(nextPass))
        nextPass -= MAX_PASS_DEPTH
      }
      return passes.flat()
    }

    return [
      `( ${IS_FRENCH ? 'coupe panneau' : 'cutting panel'} ${panel.id} )`,
      panel.uniqueID ? `( ${panel.uniqueID} )` : '',
      RAPID_MOVE(x, yStart, SAFE_HEIGHT),
      MOVE_Z(MATERIAL_HEIGHT + 0.02),
      pass(),
      PLUNGE_MOVE(x, y_, CUT_TO_DEPTH, PLUNGE_RATE),
      FEED(FEED_RATE),
      MOVE_X(x_),
      MOVE_Y(y),
      MOVE_X(x),
      MOVE_Y(y_),
      RETRACT_MOVE(SAFE_HEIGHT),
      `( ${IS_FRENCH ? 'fin panneau' : 'finished panel'} ${panel.id} )`,
    ]
  }

  function HEADER(tool, speed) {
    let [, , , material, , info] = data.csv.contents[0]
    return [
      `( ${formatDate(new Date(), 'dd.mm.yyyy HH:MM')} )`,
      `( ${data.name} )`,
      info ? `( ${info} )` : '',
      material
        ? `( ${SHEETS.length} ${IS_FRENCH ? 'feuilles de' : 'sheets of'} ${material} )`
        : `( ${SHEETS.length} ${IS_FRENCH ? 'feuilles a couper' : 'sheets to cut'} )`,
      `G40 G80 G70`,
      // `G91 G28 Z0`,
      `M06 T${tool}`,
      `G43 H${tool}`,
      `S${speed} M03`,
      `G54 G90`,
    ]
  }
  function TOOL_CHANGE(tool, speed) {
    return [`M05`, `T${tool}`, `G00 G90 G54 S${speed} M03`, `G43 H${tool}`]
  }
  function SHEET_CHANGE() {
    return [
      `M05 M104`,
      `G90 X${addPoint(X_HOME)} Y${addPoint(Y_HOME)}`,
      `M00`,
      `( changez la feuille et )`,
      `( cycle start :)`,
      `M103 M03`,
    ]
  }
  function FOOTER() {
    return [
      `G40 G80 G91 G28 Z0 M5`,
      `G00 G90 X${addPoint(X_HOME)} Y${addPoint(Y_HOME)}`,
      `M30`,
    ]
  }
  function RAPID_MOVE(x, y, z) {
    return `G00 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}`
  }
  function RETRACT_MOVE(z) {
    return `G00 Z${addPoint(z)}`
  }
  function PLUNGE_MOVE(x, y, z, f) {
    return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}`
  }
  function FEED(f) {
    return `G01 F${f}`
  }
  function FEED_MOVE(x, y, z, f) {
    return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}`
  }
  function MOVE(x, y, z) {
    return `X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}`
  }
  function MOVE_X(x) {
    return `X${addPoint(x)}`
  }
  function MOVE_Y(y) {
    return `Y${addPoint(y)}`
  }
  function MOVE_Z(z) {
    return `Z${addPoint(z)}`
  }
}

// helper functions

function addPoint(num) {
  if (/\./.test(num) || num === 0) return num
  return num.toFixed(1)
}
function columnSort(a, b, i) {
  return i % 2 === 0
    ? b.y !== a.y
      ? b.y - a.y
      : a.x - b.x
    : a.y !== b.y
    ? a.y - b.y
    : b.x - a.x
}
function rowSort(a, b, i) {
  return i % 2 === 0
    ? a.x !== b.x
      ? a.x - b.x
      : a.y - b.y
    : b.x !== a.x
    ? b.x - a.x
    : b.y - a.y
}
