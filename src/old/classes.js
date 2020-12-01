/////////////////TO DO//////////////////////////////////
// output fit ratio (per sheet and total) to compare if acceptable
// export api for use
// write csv import to panel placeable objects
// interface to upload csv and return finished output
// return info about nest efficiency
// basic cnc setup, gCode creator

/////////////////IDEAS//////////////////////////////////
// simple gui to accept or reject nested sheets
// potentially flag sheets with low score
// click sheet shuffle columns



// import { toDECIMAL } from "./methods"


    let metricUnits = false
    const CUTTER = 0.375      // end mill diameter used to space panels
    const MATERIAL = {
        width: 49,
        height: 97,
        margins: 0.25,
        maxWidth: () => MATERIAL.width - MATERIAL.margins * 2 + CUTTER,
        maxHeight: () => MATERIAL.height - MATERIAL.margins * 2 + CUTTER
    }
    const GAP = 0.005               // gap + bit size = total space between panels
    const ERRORS = []               // catch all panels that don't fit
    const targetFIT = 0.8           // minimum ratio of a good fit per sheet
    const acceptedWASTE = 0.2       // maximum acceptable waste per sheet



// let csv = [
//     [1,	2,	12,	13, ,  , ,  , ],
//     [2,	3,	13,	23],
//     [3,	2,	12,	23],
//     [4,	1,	4,	8],
//     [5,	2,	9,	23],
//     [6,	4,	23,	34],
//     [7,	1,	12,	44],
//     [8,	1,	23,	44],
//     [9,	1,	9,	44]
// ]


// let csv = [
//     [1,	2,	12,	13, ,  , ,  , ],
//     [2,	3,	13,	23],
//     [3,	2,	12,	23],
//     [4,	1,	4,	8],
//     [5,	2,	9,	23],
//     [6,	4,	23,	34],
//     [7,	1,	50,	44],
//     [8,	2,	23,	100],
//     [9,	1,	9,	44]
// ]



let csv = [
    [1,	2,	12,	13, ,  , ,  , ],
    [2,	3,	13,	23],
    [3,	2,	12,	23],
    [4,	1,	4,	8],
    [5,	2,	9,	23],
    [6,	4,	23,	34],
    [7,	1,	12,	44],
    [4,	1,	4,	8],
    [5,	2,	9,	23],
    [6,	4,	23,	34],
    [7,	1,	12,	44],
    [8,	1,	23,	44],
    [9,	1,	9,	44]
]



function panelArrayCreator( csvArray, startRow = 0 ) {
    return new List( csvArray
            .slice( startRow )
            .flatMap( i => {
                return quantityIDs( i ).map( i => new Panel( i ) ) } )
            // .flat()
        )
        .flat()
        .filterTooBig()
}

function quantityIDs( [ id, quantity, width, height ] ) {
    let n = 1, uniqueIDs = []
    while ( quantity >= n ) {
        uniqueIDs.push( [ `${id} (${n}/${quantity})`, width, height ] )
        n++
    }
    return uniqueIDs
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
    constructor( [ id, width, height ] ) {
        super()
        this.id = id
        this.width = width + CUTTER + GAP
        this.height = height + CUTTER + GAP
        this.area = this.height * this.width
        this.x0 = 0
        this.y0 = 0
    }
}

class Column extends Placement {
   constructor( width, height, area, group ){
        super()
        this.width = width
        this.height = height
        this.area = area
        this.group = group
    }
}

class Sheet extends Column {
   constructor( width, height, area, group, columns, id ){
        super( width, height, area, group  )
        this.columns = columns
        this.sheet_area = MATERIAL.width * MATERIAL.height
        this.waste_area = this.sheet_area - this.area
        this.waste_ratio = 1 - this.area / this.sheet_area
        this.id = "Sheet " + id
        delete this.placed
    }
}

class List extends Array{
//  methods for arrays of Panel or group objects
    // extending array methods
    first() {
        return this[0]
    }
    last() {
        return this[this.length-1]
    }
    flatten( dimensions = 1 ) {
        let flattened = this
        while ( dimensions-- ) {
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
        return new List( ...this.slice(1), this.first() )
    }
    // sorting methods
    ascendingWidth() {
        return new List( ...this )
            .sort(( a, b ) => b.width != a.width ?
                b.width - a.width :
                b.height - a.height)
    }
    ascendingHeight() {
        return new List( ...this )
            .sort(( a, b ) => b.height != a.height ?
                b.height - a.height :
                b.width - a.width)
    }
    filterTooBig() {
        let margin = CUTTER + MATERIAL.margins
        let tooWide = MATERIAL.width - margin
        let tooHigh = MATERIAL.height - margin
        return this.map(panel => {
                if ( panel.width > MATERIAL.width - margin ||
                     panel.height > MATERIAL.height - margin ) {
                    ERRORS.push(`panel ${panel.id} is too big`)
                    return false
                }
                return panel
            })
            .filter(panel => panel) // removes empty entry
    }
    // methods to find unplaced panels
    notPlaced() {
        return this.filter(panel => !panel.placed)
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
        return this
            .sort(( a, b ) => b.area - a.area )
            .notPlaced()
            .first()
    }
    // group measurement methods
    totalWidth() {
        return this.reduce(( total, panel ) => {
            if ( panel instanceof List ) {
                return total + panel.ascendingWidth().first().width
            }
            return total + panel.width
        }, 0)
    }
    totalHeight() {
        return this.reduce( ( total, panel ) => {
            if ( panel instanceof List ) {
                return total + panel.ascendingHeight().first().height
            }
            return total + panel.height
        }, 0 )
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
    remainingWidth( maxWidth ) {
        return maxWidth - this.totalWidth()
    }
    remainingHeight( maxHeight ) {
        return maxHeight - this.totalHeight()
    }
    fitsColumn( group, maxHeight = MATERIAL.height ) {
        return this.notPlaced()
            .filter(panel => panel.width <= group[0].width)
            .filter(panel => panel.height < group.remainingHeight( maxHeight ))
            .biggest()
    }
    fitsRow( group, maxWidth ) {
        return this.notPlaced()
            .filter(panel => panel.height <= group[0].height)
            .filter(panel => panel.width < group.remainingWidth( maxWidth ))
            .biggest()
    }
    fitsSheet( group, maxWidth = MATERIAL.width ) {
        return this.notPlaced()
            // .filter(panel => panel.height <= group[0].height)
            .filter(panel => panel.width < group.remainingWidth( maxWidth ))
            .widest()
    }
}

function fillColumn( panels ) {
    let column = new List( panels.widest().place() )
    let maxWidth = column[0].width
    // add rows of panels to column until
    // no space remains or no more panels
    while ( panels.fitsColumn( column ) ) {
        let row = new List(
            panels.fitsColumn( column ).place()
        )
        // add more panels to row if space remains
        while ( panels.fitsRow( row, maxWidth ) ) {
            row.push( panels.fitsRow( row, maxWidth ).place() )
        }
        // return nested array only if
        // more than one panel in row
        if ( row.length === 1 ) column.push( row[0] )
        else column.push( row )
    }
    // smallest pieces to center of column
    return column.shuffle()
}


function makeColumns ( panels ) {
    let columns = new List()
    while ( panels.notPlaced().length > 0 ) {
        let column = fillColumn( panels )
        columns.push( new Column (
            column.columnWidth(),       //width
            column.columnHeight(),      // height
            column.columnArea(),        // area
            column                      // group
        ))
    }
    return columns
}

function fillSheet( columns ) {
    // console.log(columns.widest());
    let sheet = new List( columns.widest().place() )
    // console.log(sheet);
    while ( columns.fitsSheet( sheet ) ) {
        sheet.push( columns.fitsSheet( sheet ).place() )
    }
    // smallest pieces to center of sheet
    return sheet.shuffle()
}

function makeSheets( panels ) {
    let columns = makeColumns( panels )
    // console.log(columns);
    let sheets =  new List()
    while ( columns.notPlaced().length > 0 ) {
        let sheet = fillSheet( columns )
        addCoordinates( sheet )
        sheets.push( new Sheet(
            sheet.filledWidth(),                        // width
            sheet.filledHeight(),                       // height
            sheet.filledArea(),                         // area
            sheet.map(list => list.group).flatten(2),   // group
            sheet,                                      // columns
            sheets.length + 1                           // id
        ))
    }
    return sheets
}

function addCoordinates( columns, startX = 0, startY = 0 ) {
    // start X and Y for svg output with multiple sheets

    let xPos = new List()

    columns.forEach( ( column, i ) => {
        // xPos map of columns, first index === start
        if ( i === 0 ) { xPos.push( startX ) }
        // everything after calculated += prev. width
        else { xPos.push(xPos.last() + columns[i - 1].width) }

        let yPos = new List()

        // iterate each row in column
        column.group.forEach( ( row, j, rows ) => {
            // yPos map of rows, first index === start
            if ( j === 0 ) { yPos.push( startY ) }
            // everything after calculated += prev. height
            // with appropriate method for row type
            else if ( rows[j - 1] instanceof List ) {
                yPos.push(yPos.last() + rows[j - 1].filledHeight())
            }
            else { yPos.push(yPos.last() + rows[j - 1].height) }

            // add x0 and y0 prop to each row in column
            if ( row instanceof Panel ) {
                row.x0 = xPos[i]
                row.y0 = yPos[j]
            }
            else {
                row.forEach(( rowCol, k ) => {
                    if ( k === 0 ) { rowCol.x0 = xPos[i] }
                    else { rowCol.x0 = row[k-1].x0 + row[k-1].width }
                    rowCol.y0 = yPos[j]
                })
            }
        })
    })
}


const p = panelArrayCreator(csv)
const s = makeSheets(p)
// console.log( p )
// console.log( makeSheets(p)[2].group[2] )
// console.log(ERRORS);

// addCoordinates(s[0].columns)
console.log( s )
let l = new List(1,[2],[2,[3]])
console.log( l.flatten());
