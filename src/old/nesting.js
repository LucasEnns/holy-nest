// panels array = [panel objects = {width: width, height: height, q: quantity, id: id, b: border, u: units}]
// a nesting algorithm implementation
// . set nesting boundary and space around parts
// . find all shapes taller than 80%??? of boundary
// . group closest matches to fill remaining space < largest smaller than x and y
// . sort remaining shapes by width in descending order
// . assign groups of shapes that maximize the boundary height
// . sort groups that optimize width
// ****idea****
//     instead of using

// necessary inputs: boundary w + h, gap or tool diameter / 2, array of shapes w + h + id + border width?

/////////////////TO DO//////////////////////////////////
// arrange groups into sheets
// output fit ratio (per sheet and total) to compare if acceptable
// export api for use
// write csv import to panel placeable objects
// interface to upload csv and return finished output
// return info about nest efficiency
// basic cnc setup, gCode creator

/////////////////IDEAS//////////////////////////////////
// simple gui to accept or reject nested sheets
// potentially flag sheets with low score



// import { toDECIMAL } from "./methods"

// export function nest(panels) {

// }

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
    return csvArray
        .slice( startRow )
        .map( i => {
            return quantityIDs( i )
                .map( i => new Panel( i ) ) } )
        .flat()
}

function quantityIDs( [ id, quantity, width, height ] ) {
    let n = 1, uniqueIDs = []
    while ( quantity >= n ) {
        uniqueIDs.push( [ `${id} #${n}/${quantity}`, width, height ] )
        n++
    }
    return uniqueIDs
}


// const place = () => ( { placed: true } )


let sheetDimension = {width: 49, height: 97, safeBorder: 0.25}
let metricUnits = false
const toolDIAMETER = 0.375      // end mill diameter used to space panels
const toolGAP = 0.005           // gap + bit size = total space between panels
const targetFIT = 0.8           // minimum ratio of a good fit per sheet
const acceptedWASTE = 0.2       // maximum acceptable waste per sheet
const acceptedDEVIATION = 1   // maximum acceptable length in group from first panel
// const tallMinHEIGHT = sheetDimension.height * 0.2

class Panel {
    constructor([id, width, height]) {
        this.id = id
        this.width = width + toolDIAMETER + toolGAP
        this.height = height + toolDIAMETER + toolGAP
        this.area = this.height * this.width
        this.placed = false
    }

    place() {
        this.placed = true
    }
}

class Group {
   constructor( group, width, height, area ){
        this.group = group
        this.width = width
        this.height = height
        this.area = area
        this.placed = false
        // this.place = placed()
    }

    place() {
        this.placed = true
    }

}

class Sheet extends Group{
   constructor( group, width, height, area, sheetID ){
        super( group, width, height, area )
        this.sheet_area = sheetDimension.width * sheetDimension.height
        this.waste_area = this.sheet_area - this.area
        this.waste_ratio = 1 - this.area / this.sheet_area
        this.sheet = sheetID
    }

}


// let x = new Group ( 1, 2, 3, 4 )

// console.log();

const _lastOf = ( array ) =>  array[array.length - 1]
const _greatestAreaHeight = ( a, b ) => b.area != a.area ? b.area - a.area : b.height - a.height
const _greatestAreaWidth = ( a, b ) => b.area != a.area ? b.area - a.area : b.width - a.width
const _leastHeight = ( a, b ) => a.height != b.height ? a.height - b.height : a.width - b.width
const _greatestHeight = ( a, b ) => b.height != a.height ? b.height - a.height : b.width - a.width
const _leastWidth = ( a, b ) => a.width != b.width ? a.width - b.width : a.height - b.height
const _greatestWidth = ( a, b ) => b.width != a.width ? b.width - a.width : b.height - a.height

const getTallest = ( group ) => group.reduce((max, panel) => Math.max(max, panel.height), group[0].height)
const getWidest = ( group ) => group.reduce((max, panel) => Math.max(max, panel.width), group[0].width)

const getTotalHeight = ( group ) => group.reduce((total, panel) => total + panel.height, 0)
const getTotalWidth = ( group ) => group.reduce((total, panel) => total + panel.width, 0)

const getGroupArea = ( group ) => group.reduce((total, panel) => total + panel.area, 0)
const getPanelArea = ( group ) => getWidest(group) * sheetDimension.height

const remainingWidth = ( group, maxWidth ) => maxWidth - getTotalWidth(group)
const remainingHeight = ( group ) => sheetDimension.height - getTotalHeight(group)
const remainingFitHeight = ( panels, forGroup ) => panels.filter(panel => !panel.placed)
                                           .filter(panel => panel.height < remainingHeight(forGroup))
const fitsRemainingWidth = ( panels, group, maxWidth ) => {

console.log(panels);


    console.log( remainingWidth( group, maxWidth ) >=
        (_lastOf(
            panels
                .filter( panel => !panel.placed )
                .filter( panel => panel.width < remainingWidth( group, maxWidth ) )
            ) ||
            sheetDimension
        ).width
    )

    return remainingWidth( group, maxWidth ) >=
        (_lastOf(
            panels
                .filter( panel => !panel.placed )
                .filter( panel => panel.width < remainingWidth( group, maxWidth ) )
            ) ||
            sheetDimension
        ).width
}

const getGroupedArrays = (group) => group.map(i => {
    if  ( !i.hasOwnProperty("group") ) return i
    else if ( i.group.length === 1 ) return i.group[0]
    else return i.group
})




const findMatchHeight = (panels, group) => {
    const shortPanel = (match) => (_lastOf(match) || sheetDimension).height
    let matches = [...panels]
        .filter(panel => !panel.placed)
        .filter(panel => panel.width <= getWidest(group) * acceptedDEVIATION)
        .filter(panel => panel.height < remainingHeight(group))
        .sort(_greatestHeight)
    while (remainingHeight(group) > shortPanel(matches)) {
        matches[0].place()
        group = [...group, placeMatchWidth(panels, [matches[0]], getWidest(group))]
        matches = remainingFitHeight(matches, group)
    }
    return group
}

const findMatchWidth = (panels, group, maxWidth) => {
    return [...panels]
        .filter(panel => !panel.placed)
        // .filter(panel => panel.height <= getTotalHeight(group) * acceptedDEVIATION)
        .filter(panel => panel.width <= remainingWidth(group, maxWidth))
        .sort(_greatestAreaWidth)
}

const placeMatchWidth =  (panels, group, maxWidth) => {
    console.log("pg", group);
    console.log(findMatchWidth( panels, group, maxWidth ));
    while ( fitsRemainingWidth(
            matches = findMatchWidth( panels, group, maxWidth ),
            group, maxWidth ) ) {
        matches[0].place()
        group = [...group, matches[0]]
        console.log("G" ,group);
    }
    return new Group(
        group,
        getTotalWidth(group),
        getTallest(group),
        getGroupArea(group)
    )
}

const sheetHeightGroups = (panels) => {

    return [...panels]
        .sort(_greatestAreaHeight)
        .map(panel => {
            if (!panel.placed) {
                panel.place()
                return findMatchHeight(panels, [panel])
            }
        })
        .filter(panel => panel) // remove empty arrays
        .map((grouped) => (
            new Group (
                getGroupedArrays(grouped),
                getWidest(grouped.flat()),
                getTotalHeight(grouped.flat()),
                getGroupArea(grouped.flat())
            )
        ))

}



const placeGroupsOnSheet = (panels) => {
    const groups = sheetHeightGroups(panels)
    // console.log(groups);
    return groups
        .sort(_greatestAreaWidth)
        .map(group => {
            if (!group.placed) {
                group.place()
                return placeMatchWidth(groups, [group], sheetDimension.width)
            }
        })
        .filter(panel => panel) // remove empty arrays
        .map((panels, index) => (
            new Sheet(
                getGroupedArrays(panels.group),
                panels.width,
                panels.height,
                panels.area,
                index + 1
            )
        ))

}

const gen = panelArrayCreator ( csv )


let x = placeGroupsOnSheet(gen)
// x = sheetHeightGroups(tall)


console.log("gen", x)
// console.log(x.map(i => i.group[0]))
// console.log(x[0].group.group[1].group[2].group)
// console.log(tall.map(i => ({
//     id: i.id,
//     height: i.height,
//     width: i.width,
//     area: i.area,
//     placed: i.placed
// })));
