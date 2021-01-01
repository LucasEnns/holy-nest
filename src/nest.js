/////////////////TO DO//////////////////////////////////

/////////////////IDEAS//////////////////////////////////
// simple gui to accept or reject nested sheets
// potentially flag sheets with low score
// click sheet shuffle columns

// new technique-- class panel widths by +- %
// if none next is +- 1/2 of width

// idea 2
// start width columns of all the similar widths
// that join columns

// import { toDECIMAL } from "./methods"

let NEST_TYPE = 'widest',
  FROM_BOTTOM = true,
  CUTTER = 0.375, // end mill diameter used to space panels
  GAP = 0, // gap + bit size = total space
  ERRORS = [], // catch all panels that don't fit
  MATERIAL = {
    // sheet size and options
    width: 49,
    height: 97,
    margins: 0.25,
    max_width: () => MATERIAL.width - MATERIAL.margins * 2 - CUTTER,
    max_height: () => MATERIAL.height - MATERIAL.margins * 2 - CUTTER,
  }

export function Nest(
  panels,
  firstPanelRow = 1,
  nestType = NEST_TYPE,
  metricUnits = false,
  fromBottom = FROM_BOTTOM,
  cutter = CUTTER,
  gap = GAP,
  material = MATERIAL
) {
  function panelArrayCreator() {
    // console.log(CSVToArray( panels ));
    return new List(
      panels.slice(firstPanelRow).flatMap((i) => {
        return quantityIDs(i).map((i) => new Panel(i))
      })
    ).flat()
  }

  function quantityIDs([id, quantity, width, height]) {
    if (width > MATERIAL.max_width() || height > MATERIAL.max_height()) {
      ERRORS.push(`Panneau ${id} est trop gros`)
      // ERRORS.push(`Panel ${id} is too big`)
      return []
    } else if (!width || !height || !quantity) return []
    let n = 1,
      uniqueIDs = []
    while (quantity >= n) {
      let q = ''
      if (quantity > 1) q = `${n} sur ${quantity}`
      // if ( quantity > 1 ) q = `${n} of ${quantity}`
      uniqueIDs.push([q, id, parseFloat(width), parseFloat(height)])
      n++
    }
    return uniqueIDs
  }

  ERRORS = []
  const PANELS = panelArrayCreator() // raw csv panel input converted
  // const METRIC_UNITS = metricUnits  // default false
  // const TARGET_FIT = 0.8                      // ratio of a good fit per sheet
  NEST_TYPE = nestType
  FROM_BOTTOM = fromBottom
  CUTTER = cutter
  GAP = gap
  MATERIAL.width = material.width
  MATERIAL.height = material.height
  MATERIAL.margins = material.margins

  function fillColumn(panels) {
    let column = new List(panels.widest().place())
    let maxWidth = column[0].width
    // add rows of panels to column until
    // no space remains or no more panels
    while (panels.fitsColumn(column)) {
      let row = new List(panels.fitsColumn(column).place())
      // add more panels to row if space remains
      while (panels.fitsRow(row, maxWidth)) {
        row.push(panels.fitsRow(row, maxWidth).place())
      }
      // return nested array only if
      // more than one panel in row
      if (row.length === 1) column.push(row[0])
      else column.push(row)
    }
    // smallest pieces to center of column
    // return column.shuffle()
    return column.ascendingWidth()
  }

  function makeColumns(panels) {
    let columns = new List()
    while (panels.notPlaced().length > 0) {
      let column = fillColumn(panels)
      columns.push(
        new Column(
          column.columnWidth(), //width
          column.columnHeight(), // height
          column.columnArea(), // area
          column // group
        )
      )
    }
    return columns
  }

  function fillSheet(columns) {
    let sheet = new List(columns.placementBy().place())
    while (columns.fitsSheet(sheet)) {
      sheet.push(columns.fitsSheet(sheet).place())
    }
    // smallest pieces to center of sheet
    // return sheet.shuffle()
    return sheet.ascendingHeight()
  }

  function makeSheets(panels) {
    let columns = makeColumns(panels)
    let sheets = new List()
    while (columns.notPlaced().length > 0) {
      let sheet = fillSheet(columns)
      addCoordinates(sheet)
      sheets.push(
        new Sheet(
          sheet.filledWidth(), // width
          sheet.filledHeight(), // height
          sheet.filledArea(), // area
          sheet.map((list) => list.group).flatten(2), // group
          sheet, // columns
          sheets.length + 1 // id
        )
      )
    }
    return sheets
  }

  function addCoordinates(columns) {
    let margin = MATERIAL.margins - CUTTER / 2

    let xPos = new List()
    let startX = margin
    columns.forEach((column, i) => {
      // xPos map of columns, first index === start
      if (i === 0) {
        xPos.push(startX)
      }
      // everything after calculated += prev. width
      else {
        xPos.push(xPos.last() + columns[i - 1].width)
      }

      let yPos = new List()
      let startY = FROM_BOTTOM ? margin : MATERIAL.height - margin

      // iterate each row in column
      column.group.forEach((row, j, rows) => {
        // yPos map of rows, first index === start
        if (firstIndex(j)) {
          FROM_BOTTOM
            ? yPos.push(startY)
            : yPos.push(startY - row.filledHeight())
        } else {
          FROM_BOTTOM
            ? yPos.push(yPos.last() + rows[j - 1].filledHeight())
            : yPos.push(yPos.last() - row.filledHeight())
        }

        // add x0 and y0 prop to each row in column
        if (row instanceof Panel) {
          firstIndex(i) && columns.length > 1
            ? (row.x0 = xPos[i] + columns[i].width - row.width)
            : (row.x0 = xPos[i])
          row.y0 = yPos[j]
        } else {
          row.forEach((rowCol, k) => {
            firstIndex(k)
              ? firstIndex(i) && columns.length > 1
                ? (rowCol.x0 = xPos[i] + columns[i].width - rowCol.width)
                : (rowCol.x0 = xPos[i])
              : firstIndex(i) && columns.length > 1
              ? (rowCol.x0 = row[k - 1].x0 - rowCol.width)
              : (rowCol.x0 = row[k - 1].x0 + row[k - 1].width)
            FROM_BOTTOM
              ? (rowCol.y0 = yPos[j])
              : (rowCol.y0 = yPos[j - 1] - rowCol.height)
          })
        }
      })
    })
  }

  let sheets = makeSheets(PANELS)
  return [PANELS, sheets, ERRORS]
}

function firstIndex(index) {
  return index === 0
}

class Placement {
  constructor() {
    this.placed = false
  }
  place() {
    this.placed = true
    return this
  }
}

class Panel extends Placement {
  constructor([uniqueID, id, width, height]) {
    super()
    this.uniqueID = uniqueID
    this.id = id
    this.width = width + CUTTER + GAP
    this.height = height + CUTTER + GAP
    this.area = this.height * this.width
    this.x0 = 0
    this.y0 = 0
  }

  filledWidth() {
    return this.width
  }
  filledHeight() {
    return this.height
  }
}

class Column extends Placement {
  constructor(width, height, area, group) {
    super()
    this.width = width
    this.height = height
    this.area = area
    this.group = group
  }
}

class Sheet extends Column {
  constructor(width, height, area, group, columns, id) {
    super(width, height, area, group)
    this.columns = columns
    this.sheet_width = MATERIAL.width
    this.sheet_height = MATERIAL.height
    this.sheet_area = MATERIAL.width * MATERIAL.height
    this.waste_area = this.sheet_area - this.area
    this.waste_ratio = 1 - this.area / this.sheet_area
    this.id = 'Feuille ' + id
    // this.id = "Sheet " + id
    delete this.placed
  }
}

class List extends Array {
  //  methods for arrays of Panel or group objects
  // extending array methods
  first() {
    return this[0]
  }
  last() {
    return this[this.length - 1]
  }
  flatten(dimensions = 1) {
    let flattened = this
    while (dimensions--) {
      flattened = flattened.flat()
      // dimensions--
    }
    return flattened
  }
  // removeIndex( index ) {
  //     let list = [...this]
  //     this = [...list.slice(0, index), ...list.slice(index + 1)]
  // }
  // removeValue( value ) {
  //     this.removeIndex( array.indexOf( value ) )
  // }
  shuffle() {
    if (this.length < 3) return this
    return new List(...this.slice(1), this.first())
  }
  // sorting methods
  ascendingWidth() {
    return new List(...this).sort((a, b) =>
      b.width != a.width ? b.width - a.width : b.height - a.height
    )
  }
  ascendingHeight() {
    return new List(...this).sort((a, b) =>
      b.height != a.height ? b.height - a.height : b.width - a.width
    )
  }
  // methods to find unplaced panels
  notPlaced() {
    return this.filter((panel) => !panel.placed)
  }
  widest() {
    return this.notPlaced().ascendingWidth().first()
  }
  narrowest() {
    return this.notPlaced().ascendingWidth().last()
  }
  tallest() {
    return this.notPlaced().ascendingHeight().first()
  }
  shortest() {
    return this.notPlaced().ascendingHeight().last()
  }
  biggest() {
    return this.sort((a, b) => b.area - a.area)
      .notPlaced()
      .first()
  }
  smallest() {
    return this.sort((a, b) => a.area - b.area)
      .notPlaced()
      .first()
  }
  // placementBy = { "widest": widest(), "tallest": tallest() }
  placementBy() {
    switch (NEST_TYPE) {
      case 'widest':
        return this.widest()
      case 'narrowest':
        return this.narrowest()
      case 'tallest':
        return this.tallest()
      case 'shortest':
        return this.shortest()
      case 'biggest':
        return this.biggest()
      case 'smallest':
        return this.smallest()
      default:
        break
    }
  }
  // group measurement methods
  totalWidth() {
    return this.reduce((total, panel) => {
      if (panel instanceof List) {
        return total + panel.ascendingWidth().first().width
      }
      return total + panel.width
    }, 0)
  }
  totalHeight() {
    return this.reduce((total, panel) => {
      if (panel instanceof List) {
        return total + panel.ascendingHeight().first().height
      }
      return total + panel.height
    }, 0)
  }
  totalArea() {
    return this.reduce((total, panel) => total + panel.area, 0)
  }
  columnWidth() {
    return this.flat().ascendingWidth().first().width
  }
  columnHeight() {
    return this.totalHeight()
  }
  columnArea() {
    return this.flat().totalArea()
  }
  filledHeight() {
    return this.ascendingHeight().first().height
  }
  filledWidth() {
    return this.totalWidth()
  }
  filledArea() {
    return this.flat().totalArea()
  }
  remainingWidth(maxWidth) {
    return maxWidth - this.totalWidth()
  }
  remainingHeight(maxHeight) {
    return maxHeight - this.totalHeight()
  }
  fitsColumn(group, maxHeight = MATERIAL.height) {
    return this.notPlaced()
      .filter((panel) => panel.width <= group[0].width)
      .filter((panel) => panel.height < group.remainingHeight(maxHeight))
      .placementBy()
  }
  fitsRow(group, maxWidth) {
    return this.notPlaced()
      .filter((panel) => panel.height <= group[0].height)
      .filter((panel) => panel.width < group.remainingWidth(maxWidth))
      .placementBy()
  }
  fitsSheet(group, maxWidth = MATERIAL.width) {
    return this.notPlaced()
      .filter((panel) => panel.width < group.remainingWidth(maxWidth))
      .placementBy()
  }
}
