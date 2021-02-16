import { CHARACTERS } from './engravingFont.js'
import { formatDate, cleanFloat } from './methods.js'

export function Gcode(data, settings) {
  let CURRENT_TOOL = 9
  const SHEETS = data.sheets,
    RAPID = '00',
    FEED = '01',
    SPINDLE_SPEED = () => settings.cnc[CURRENT_TOOL].spindle,
    FEED_RATE = () => settings.cnc[CURRENT_TOOL].feed,
    PLUNGE_RATE = () => settings.cnc[CURRENT_TOOL].plunge,
    PLUNGE_DISTANCE = () => settings.cnc[CURRENT_TOOL].ramp,
    X_HOME = settings.material.width / 2 || 30.0,
    Y_HOME = Math.min(settings.material.height + 10, 122),
    SAFE_HEIGHT = settings.material.thickness + 0.25 || 2,
    MATERIAL_HEIGHT = settings.material.thickness,
    PROFILE_DEPTH = cleanFloat(
      Math.max(MATERIAL_HEIGHT - data.tools.profile.cut_depth, 0)
    ),
    MAX_PASS_DEPTH = settings.cnc[CURRENT_TOOL].pass_depth,
    LINK_DEPTH = PROFILE_DEPTH + data.tools.profile.link,
    SMALL_PANEL = data.tools.profile.min_size,
    PROFILE_TOOL = settings.tools.profile,
    ENGRAVE = data.tools.engraver.engrave,
    ENGRAVE_TOOL = settings.tools.engraver

  let output = HEADER()
  SHEETS.forEach((sheet, index, array) => {
    output += `( []: ${index + 1} )\n`
    if (ENGRAVE) {
      output += TOOL_CHANGE(ENGRAVE_TOOL)
      sheet.columns.forEach((column, index) => {
        column.group
          .flat()
          .sort((a, b) => sortColumnOrRow(settings.nestTypeColumn, a, b, index))
          .forEach(
            (panel) =>
              (output += ENGRAVE_LABEL({
                label: panel.id,
                engravingDepth: data.tools.engraver.cut_depth,
                xStart: panel.x + 1,
                yStart: panel.y + 1,
                size: data.tools.engraver.size,
                spacing: data.tools.engraver.spacing,
                direction: data.tools.engraver.direction,
              }))
          )
      })
    }
    output += TOOL_CHANGE(PROFILE_TOOL)
    sheet.columns.forEach((column, index) => {
      column.group
        .flat()
        .sort((a, b) => sortColumnOrRow(settings.nestTypeColumn, a, b, index))
        .forEach((panel) => (output += PROFILE_CUT(panel)))
    })
    if (index !== array.length - 1) output += SHEET_CHANGE()
  })
  output += FOOTER()

  return output

  ///////////////////////////////////
  //    helpers to write g-code
  //////////////////////////////////

  function PROFILE_CUT(panel) {
    const x = cleanFloat(panel.x),
      y = cleanFloat(panel.y),
      x_ = cleanFloat(x + panel.width),
      y_ = cleanFloat(y + panel.height),
      yStart = cleanFloat(y_ - PLUNGE_DISTANCE())

    return (
      `( ------------------ )\n` +
      `( ${panel.id} )\n` +
      MOVE({ x, y: yStart, z: SAFE_HEIGHT }) +
      MOVE({ z: MATERIAL_HEIGHT + 0.005 }) +
      pass() +
      MOVE({ g: RAPID, z: SAFE_HEIGHT })
    )

    function pass() {
      const contour = (depth) =>
        MOVE({ g: FEED, y: y_, z: depth, f: PLUNGE_RATE() }) +
        MOVE({ x: x_, f: FEED_RATE() }) +
        MOVE({ y }) +
        MOVE({ x }) +
        MOVE({ y: depth === PROFILE_DEPTH ? y_ : yStart })

      let fullDepth = false,
        passes = '',
        depth = MATERIAL_HEIGHT,
        smallPanel = () =>
          depth === PROFILE_DEPTH &&
          (panel.width < SMALL_PANEL || panel.height < SMALL_PANEL)
      while (!fullDepth) {
        depth = Math.max(depth - MAX_PASS_DEPTH, PROFILE_DEPTH)
        if (smallPanel()) passes += contour(LINK_DEPTH)
        passes += contour(depth)
        if (depth === PROFILE_DEPTH) fullDepth = true
      }
      return passes
    }
  }
  function ENGRAVE_LABEL({
    label,
    engravingDepth = 0.005,
    xStart = 1,
    yStart = 1,
    size = 0.3,
    spacing = 0.1,
    direction = 'ltr',
  }) {
    return engravingGcode()

    function engravingGcode() {
      return characterArray()
        .map((character, index) => characterToGcode(character, index))
        .join('')
      function characterArray() {
        return sanitizeString(label).split('')
      }
      function sanitizeString(string) {
        return (
          string + ''.toUpperCase().replace(/[^A-Z0-9\[\]\,\'\s\-\=]/gi, '')
        )
      }
    }
    function characterToGcode(character, notFirstCharacter) {
      if (notFirstCharacter) moveStartingPoint()
      if (character === ' ') return

      return (
        `( ------------------ )\n( ${character} )\n` +
        engravePath() +
        liftEngraver()
      )

      function moveStartingPoint() {
        if (direction === 'ltr') xStart += spacing + size / 2
        else yStart -= spacing + size
      }
      function engravePath() {
        return (
          CHARACTERS[character]
            .map(([x, y, z = ''], index) => {
              // only for the first point
              if (!index) {
                return (
                  // rapid move to first point
                  MOVE({ g: RAPID, x: posX(x), y: posY(y) }) +
                  // lower engraver to material
                  MOVE({ g: FEED, z: posZ('-'), f: 200 })
                )
              }
              // move engraver to next point
              return MOVE({ x: posX(x), y: posY(y), z: posZ(z) })
            })
            // turn array back to string
            .join('')
        )
      }
      function liftEngraver() {
        return MOVE({ g: RAPID, z: SAFE_HEIGHT })
      }
      function posX(x) {
        return cleanFloat(xStart + resizeCharacter(x))
      }
      function posY(y) {
        return cleanFloat(yStart + resizeCharacter(y))
      }
      function posZ(z) {
        if (z === '+') return SAFE_HEIGHT
        if (z === '-') return MATERIAL_HEIGHT - engravingDepth
        return z
      }
      function resizeCharacter(point) {
        return point * 0.25 * size
      }
    }
  }
  function MOVE({ g = '', x = '', y = '', z = '', f = '' }) {
    return G() + X() + Y() + Z() + F() + '\n'

    function G() {
      return g === '' ? g : `G${g} `
    }
    function X() {
      return x === '' ? x : `X${addDecimal(x)} `
    }
    function Y() {
      return y === '' ? y : `Y${addDecimal(y)} `
    }
    function Z() {
      return z === '' ? z : `Z${addDecimal(z)} `
    }
    function F() {
      return f === '' ? f : `F${f}`
    }
  }
  function HEADER() {
    let [, , , material, , info] = data.csv.contents[0]
    return (
      `( ${formatDate(new Date(), 'dd.mm.yyyy HH:MM')} )\n` +
      `( ${data.name} )\n` +
      `${info ? `( ${info} )\n` : ''}` +
      `( ------------------ )\n` +
      `G40 G80 G70\n` +
      `( ------------------ )\n` +
      `( ${SHEETS.length}: [] ${material ? material : ''} )\n`
    )
  }
  function TOOL_CHANGE(tool) {
    if (CURRENT_TOOL === tool) return ''
    CURRENT_TOOL = tool
    return (
      `( ------------------ )\n` +
      `M05\n` +
      `M06 T${CURRENT_TOOL}\n` +
      `G43 H${CURRENT_TOOL}\n` +
      `S${SPINDLE_SPEED()} M03\n` +
      `G54 G90 G00\n`
    )
  }
  function SHEET_CHANGE() {
    return (
      `( ------------------ )\n` +
      `M05 M104\n` +
      MOVE({ g: '90', x: X_HOME, y: Y_HOME }) +
      `M00\n` +
      `M103 M03 G00\n` +
      `( ------------------ )\n` +
      `( CYCLE START :)\n`
    )
  }
  function FOOTER() {
    return (
      `( ------------------ )\n` +
      `G40 G80 G91 G28 Z0 M5\n` +
      'G90\n' +
      MOVE({ g: RAPID, x: X_HOME, y: Y_HOME }) +
      `M30`
    )
  }
}

// helper functions

function addDecimal(num) {
  if (/\./.test(num) || num === 0) return num
  return num.toFixed(1)
}

function sortColumnOrRow(test, a, b, i) {
  return test ? columnSort() : rowSort()
  function columnSort() {
    return i % 2 === 0
      ? b.y !== a.y
        ? b.y - a.y
        : a.x - b.x
      : a.y !== b.y
      ? a.y - b.y
      : b.x - a.x
  }
  function rowSort() {
    return i % 2 === 0
      ? a.x !== b.x
        ? a.x - b.x
        : a.y - b.y
      : b.x !== a.x
      ? b.x - a.x
      : b.y - a.y
  }
}
