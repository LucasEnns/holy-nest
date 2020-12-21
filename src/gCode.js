///////////////////////////////////////////////////////
// TO DO
//////////////////////////////////////////////////////
// add support for tool library


import { formatDate } from "./methods.js";

let TOOL_NUMBER = 9
let SPINDLE_SPEED = 18000
let FEED_RATE = 400
let PLUNGE_RATE = 50
let X_HOME = 30.0
let Y_HOME = 120.0
// let Z_HOME = 0
let SAFE_HEIGHT = 1
let CUT_TO_DEPTH = 0

function HEADER( tool, speed, fileName ) {
    return [
        `( ${fileName} )`,
        `( ${formatDate(new Date(), 'yyyy/mm/dd H:M')} )`,
        `G40 G80 G91 G28 Z0`,
        `G70`,
        `M6 T${tool}`,
        `S${speed} M3`,
        `G54 G90`,
        `G43 H${tool}`
    ]
}
function TOOL_CHANGE( tool, speed ) {
    return [
        `M05`,
        `G91 G28 Z0`,
        `T${tool}`,
        `G00 G90 G54 S${speed} M3`,
        `G43 H${tool}`
    ]
}
function SHEET_CHANGE( x, y ) {
    return [
        `M05`,
        `G90 X${addPoint(x)} Y${addPoint(y)}`,
        `M00`,
        `( Add new sheet and press cycle start :)`
    ]
}
function FOOTER() {
    return [
        `G40 G80 G91 G28 Z0 M5`,
        `G00 G90 X${addPoint(X_HOME)} Y${addPoint(Y_HOME)}`,
        `M30`
    ]
}
function RAPID_MOVE( x, y, z ) { return `G00 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}` }
function RETRACT_MOVE( z ) { return `G00 Z${addPoint(z)}` }
function PLUNGE_MOVE( x, y, z, f ) { return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}` }
function FEED_MOVE( x, y, z, f ) { return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}` }
function MOVE( x, y, z ) { return `X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}` }
function MOVE_X( x ) { return `X${addPoint(x)}` }
function MOVE_Y( y ) { return `Y${addPoint(y)}` }
function MOVE_Z( z ) { return `Z${addPoint(z)}` }

function addPoint ( num ) {
    if ( /\./.test( num ) || num === 0 ) return num
    return num.toFixed(1)
}

export function Gcode( sheets, material ,fileName ) {
    SAFE_HEIGHT = material.thickness + 0.5
    X_HOME = material.width / 2
    Y_HOME = material.height + 10 // add limit to 122"
    let output = [ ...HEADER( TOOL_NUMBER, SPINDLE_SPEED, fileName ) ]
    sheets.forEach( sheet => {
        output.push(`( ${sheet.id} )`)
        sheet.columns.forEach( (column, index) => {
            column.group.flat().sort(( a, b ) => index % 2 !== 0 ?
                a.y0 != b.y0 : b.y0 != a.y0 ?
                b.y0 - a.y0 : b.x0 - a.x0)
            .forEach( panel => output.push( profileCut( panel ) ))
        })
        output.push( SHEET_CHANGE( X_HOME, Y_HOME ) )
    })
    output.pop() // get rid of last sheet change
    output.push( FOOTER() )
    return output.flat().join('\n')
}

function profileCut( panel ) {
    const { x0, y0, width, height } = panel
    let x_ = x0 + width
    let y_ = y0 + height
    let yStart = y0 + height / 5
    let yEnd = yStart + SAFE_HEIGHT

    return [
        `( cutting panel ${panel.uniqueID} )`,
        RAPID_MOVE( x0, yStart, SAFE_HEIGHT ),
        PLUNGE_MOVE( x0, yEnd, CUT_TO_DEPTH, PLUNGE_RATE ),
        FEED_MOVE( x0, y_, CUT_TO_DEPTH, FEED_RATE ),
        MOVE_X( x_ ),
        MOVE_Y( y0 ),
        MOVE_X( x0 ),
        MOVE_Y( yEnd ),
        RETRACT_MOVE( SAFE_HEIGHT )
    ]
}
