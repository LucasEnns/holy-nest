export function Nest(panelCSV, settings) {
  let ERRORS = [],
    NEST_ORDER = settings.nestOrder || 'automatic',
    IS_FROM_BOTTOM = settings.nestDirectionBottom,
    IS_BY_COLUMNS = settings.nestTypeColumn,
    CUTTER = settings.cnc[settings.tools.profile].diameter || 0.375,
    MATERIAL = {
      width: settings.material.width || 49,
      height: settings.material.height || 97,
      margins: settings.material.margins || 0.25,
      max_width: () => MATERIAL.width - MATERIAL.margins * 2,
      max_height: () => MATERIAL.height - MATERIAL.margins * 2,
    }
  let PANELS = preprocessPanels(panelCSV)

  if (NEST_ORDER == 'automatic') {
    let sheets = optimalNesting()
    return {
      sheets,
      errors: ERRORS,
      averageWaste: calculateAverageWaste(sheets),
    }
  } else {
    let sheets = makeSheets(panelsWithNestingOrder(NEST_ORDER))
    return {
      sheets,
      errors: ERRORS,
      averageWaste: calculateAverageWaste(sheets),
    }
  }

  function optimalNesting() {
    let bestFit = undefined,
      nestingOrders = ['widest', 'tallest', 'biggest']

    for (let isByColumns of [false, true]) {
      IS_BY_COLUMNS = isByColumns

      for (let order of nestingOrders) {
        let panels = panelsWithNestingOrder(order),
          sheets = makeSheets(panels)
        if (sheets.empty()) return sheets
        let sheetSpaceUsed = sheets.last().area,
          thisFit = {
            isByColumns,
            order,
            sheets: sheets.length,
            sheetSpaceUsed,
          }

        if (!bestFit) bestFit = thisFit
        if (bestFit.sheets > sheets.length) bestFit = thisFit
        if (bestFit.sheets < sheets.length) continue
        if (bestFit.sheetSpaceUsed > sheetSpaceUsed) bestFit = thisFit
      }
    }
    IS_BY_COLUMNS = bestFit.isByColumns
    let panels = panelsWithNestingOrder(bestFit.order)
    return makeSheets(panels)
  }

  function calculateAverageWaste(sheets) {
    if (sheets.empty()) return false
    return {
      all:
        (sheets.reduce((total, v) => total + v.waste_ratio, 0) /
          sheets.length) *
        100,
      full:
        (sheets.slice(0, -1).reduce((total, v) => total + v.waste_ratio, 0) /
          (sheets.length - 1)) *
        100,
    }
  }

  //////////// PANEL FUNCTIONS //////////////////////////

  function panelsWithNestingOrder(nestingOrder) {
    return PANELS.map((v) => new Panel([...v, nestingOrder]))
  }

  function preprocessPanels(csv) {
    return new List(csv.flatMap((v) => preprocessor(v))).flat()

    function preprocessor([id, quantity, width, height]) {
      return removeDoesNotFit()

      function removeDoesNotFit() {
        if (width > MATERIAL.max_width() || height > MATERIAL.max_height()) {
          ERRORS.push(`Panneau ${id} est trop gros`)
          return []
        } else if (!width || !height || !quantity) return []
        return makeMultiplesUnique()
      }
      function makeMultiplesUnique() {
        let n = 0,
          panelOutput = []
        width += CUTTER
        height += CUTTER
        while (quantity > n++) {
          let qID = ''
          if (quantity > 1) qID = `${n} sur ${quantity}`
          // if ( quantity > 1 ) q = `${n} of ${quantity}`
          panelOutput.push([qID, id, width, height])
        }
        return panelOutput
      }
    }
  }

  //////////// NESTING FUNCTIONS //////////////////////////

  function fillRow(panels) {
    let row = new List(panels.placementBy().place())
    let maxHeight = row[0].height
    // add columns of panels to row until no space remains or no more panels
    while (panels.fitsRow(row, MATERIAL.max_width())) {
      let column = new List(panels.fitsRow(row, MATERIAL.max_width()).place())
      // add more panels to column if space remains
      while (panels.fitsColumn(column, maxHeight)) {
        column.push(panels.fitsColumn(column, maxHeight).place())
      }
      // return nested array only if more than one panel in column
      if (column.length === 1) row.push(column[0])
      else row.push(column)
    }
    return row.ascendingHeight()
  }
  function makeRows(panels) {
    let rows = new List()
    while (panels.notPlaced().length > 0) {
      let row = fillRow(panels)
      rows.push(
        new Row(
          row.rowWidth(),
          row.rowHeight(),
          row.totalArea(),
          row,
          panels[0].nestOrder
        )
      )
    }
    return rows
  }

  function fillColumn(panels) {
    let column = new List(panels.placementBy().place())
    let maxWidth = column[0].width
    // add rows of panels to column until no space remains or no more panels
    while (panels.fitsColumn(column, MATERIAL.max_height())) {
      let row = new List(
        panels.fitsColumn(column, MATERIAL.max_height()).place()
      )
      // add more panels to row if space remains
      while (panels.fitsRow(row, maxWidth)) {
        row.push(panels.fitsRow(row, maxWidth).place())
      }
      // return nested array only if more than one panel in row
      if (row.length === 1) column.push(row[0])
      else column.push(row)
    }
    // smallest pieces to center of column
    return column.ascendingWidth()
  }

  function makeColumns(panels) {
    let columns = new List()
    while (panels.notPlaced().length > 0) {
      let column = fillColumn(panels)
      columns.push(
        new Column(
          column.columnWidth(),
          column.columnHeight(),
          column.totalArea(),
          column,
          panels[0].nestOrder
        )
      )
    }
    return columns
  }

  function fillSheetColumns(columns) {
    let sheet = new List(columns.placementBy().place())
    while (columns.fitsSheetColumn(sheet, MATERIAL.max_width())) {
      sheet.push(columns.fitsSheetColumn(sheet, MATERIAL.max_width()).place())
    }
    return sheet.ascendingHeight()
  }

  function fillSheetRows(rows) {
    let sheet = new List(rows.placementBy().place())
    while (rows.fitsSheetRow(sheet, MATERIAL.max_height())) {
      sheet.push(rows.fitsSheetRow(sheet, MATERIAL.max_height()).place())
    }
    return sheet.ascendingWidth()
  }

  function makeSheets(panels) {
    let sheets = new List()
    if (IS_BY_COLUMNS) {
      let columns = makeColumns(panels)
      while (columns.notPlaced().length > 0) {
        let sheet = fillSheetColumns(columns)
        addCoordinatesColumn(sheet)
        sheets.push(
          new Sheet(
            sheet.rowWidth(),
            sheet.rowHeight(),
            sheet.totalArea(),
            sheet.map((list) => list.group).flatten(2),
            sheet,
            sheets.length + 1,
            MATERIAL
          )
        )
      }
    } else {
      let rows = makeRows(panels)
      while (rows.notPlaced().length > 0) {
        let sheet = fillSheetRows(rows)
        addCoordinatesRow(sheet)
        sheets.push(
          new Sheet(
            sheet.columnWidth(), // width
            sheet.columnHeight(), // height
            sheet.totalArea(), // area
            sheet.map((list) => list.group).flatten(2), // group
            sheet, // columns
            sheets.length + 1, // id
            MATERIAL
          )
        )
      }
    }
    return sheets
  }

  function addCoordinatesRow(rows) {
    let margin = MATERIAL.margins - CUTTER / 2

    let yPos = new List()
    rows.forEach((row, i) => {
      if (i === 0) {
        yPos.push(
          IS_FROM_BOTTOM ? margin : MATERIAL.height - margin - row.height
        )
      } else {
        yPos.push(
          IS_FROM_BOTTOM
            ? yPos.last() + rows[i - 1].height
            : yPos.last() - row.height
        )
      }
      let xPos = new List()
      row.group.forEach((column, j, columns) => {
        // yPos map of rows, first index === start
        xPos.push(
          firstIndex(j) ? margin : xPos.last() + columns[j - 1].columnWidth()
        )
        // add x and y prop to each row in column
        // not good clean code -- needs refactoring -- maybe use switch case
        let isFirstRow = firstIndex(i) && rows.length > 1
        if (column instanceof Panel) {
          column.y = isFirstRow // true? align top otherwise align bottom
            ? yPos[i] + rows[i].height - column.height
            : yPos[i]
          column.x = xPos[j]
        } else {
          column.forEach((rowCol, k) => {
            rowCol.y = firstIndex(k)
              ? isFirstRow // true? align top otherwise align bottom
                ? yPos[i] + rows[i].height - rowCol.height
                : yPos[i]
              : isFirstRow // true? align top otherwise align bottom
              ? column[k - 1].y - rowCol.height
              : column[k - 1].y + column[k - 1].height
            rowCol.x = xPos[j]
          })
        }
      })
    })
  }

  function addCoordinatesColumn(columns) {
    let margin = MATERIAL.margins - CUTTER / 2

    let xPos = new List()
    columns.forEach((column, i) => {
      // xPos map of columns, first index === start
      if (i === 0) {
        xPos.push(margin)
      }
      // everything after calculated += prev. width
      else {
        xPos.push(xPos.last() + columns[i - 1].width)
      }
      let yPos = new List()
      column.group.forEach((row, j, rows) => {
        yPos.push(
          firstIndex(j)
            ? IS_FROM_BOTTOM
              ? margin
              : MATERIAL.height - margin - row.rowHeight()
            : IS_FROM_BOTTOM
            ? yPos.last() + rows[j - 1].rowHeight()
            : yPos.last() - row.rowHeight()
        )
        // add x and y prop to each row in column
        // not good clean code -- needs refactoring
        let isFirstColumn = firstIndex(i) && columns.length > 1
        if (row instanceof Panel) {
          row.x = isFirstColumn // true? align right otherwise align left
            ? xPos[i] + columns[i].width - row.width
            : xPos[i]
          row.y = yPos[j]
        } else {
          row.forEach((rowCol, k) => {
            rowCol.x = firstIndex(k)
              ? isFirstColumn // true? align right otherwise align left
                ? xPos[i] + columns[i].width - rowCol.width
                : xPos[i]
              : isFirstColumn // true? align right otherwise align left
              ? row[k - 1].x - rowCol.width
              : row[k - 1].x + row[k - 1].width
            rowCol.y = IS_FROM_BOTTOM ? yPos[j] : yPos[j - 1] - rowCol.height
          })
        }
      })
    })
  }

  function firstIndex(index) {
    return index === 0
  }
}

//////////// CLASSES //////////////////////////

class Placement {
  constructor(nestOrder) {
    this.placed = false
    this.nestOrder = nestOrder
  }
  place() {
    this.placed = true
    return this
  }
}
class Panel extends Placement {
  constructor([quantityID, id, width, height, nestOrder]) {
    super(nestOrder)
    this.nestOrder = nestOrder
    this.quantityID = quantityID
    this.id = id
    this.width = width
    this.height = height
    this.area = this.height * this.width
    this.x = 0
    this.y = 0
  }

  columnWidth() {
    return this.width
  }
  rowHeight() {
    return this.height
  }
}
class Column extends Placement {
  constructor(width, height, area, group, nestOrder) {
    super(nestOrder)
    this.width = width
    this.height = height
    this.area = area
    this.group = group
  }
}
class Row extends Column {
  constructor(width, height, area, group, nestOrder) {
    super(width, height, area, group, nestOrder)
  }
}
class Sheet extends Column {
  constructor(width, height, area, group, columns, id, sheet) {
    super(width, height, area, group)
    this.columns = columns
    this.sheet_width = sheet.width
    this.sheet_height = sheet.height
    this.sheet_area = sheet.width * sheet.height
    this.waste_area = this.sheet_area - this.area
    this.waste_ratio = 1 - this.area / this.sheet_area
    this.id = 'Feuille ' + id
    // this.id = "Sheet " + id
    delete this.placed
  }
}
class List extends Array {
  first() {
    return this[0]
  }
  last() {
    return this[this.length - 1]
  }
  empty() {
    return this.length == 0
  }
  flatten(dimensions = 1) {
    let flattened = this
    while (dimensions--) {
      flattened = flattened.flat()
    }
    return flattened
  }
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
  placementBy() {
    return {
      widest: this.widest(),
      tallest: this.tallest(),
      biggest: this.biggest(),
    }[this.length ? this[0].nestOrder : '']
  }
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
    return this.flatten(3).reduce((total, panel) => total + panel.area, 0)
  }
  columnWidth() {
    return this.flat().ascendingWidth().first().width
  }
  columnHeight() {
    return this.totalHeight()
  }
  rowWidth() {
    return this.totalWidth()
  }
  rowHeight() {
    return this.flat().ascendingHeight().first().height
  }
  remainingWidth(maxWidth) {
    return maxWidth - this.totalWidth()
  }
  remainingHeight(maxHeight) {
    return maxHeight - this.totalHeight()
  }
  fitsColumn(group, maxHeight) {
    return this.filter((panel) => panel.width <= group[0].width).fitsSheetRow(
      group,
      maxHeight
    )
  }
  fitsRow(group, maxWidth) {
    return this.filter(
      (panel) => panel.height <= group[0].height
    ).fitsSheetColumn(group, maxWidth)
  }
  fitsSheetColumn(group, maxWidth) {
    return this.notPlaced()
      .filter((panel) => panel.width < group.remainingWidth(maxWidth))
      .placementBy()
  }
  fitsSheetRow(group, maxHeight) {
    return this.notPlaced()
      .filter((panel) => panel.height < group.remainingHeight(maxHeight))
      .placementBy()
  }
}
