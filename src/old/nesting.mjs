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



// import { toDECIMAL } from "./methods"

// export function nest(panels) {

// }

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
//
// import * as fs from 'fs'
// import pkg from 'fast-csv'
// const { parseFile, parseStream } = pkg
// import { parseFile } from 'fast-csv';
// import {CSVToArray} from './csv-1.js';
// const test = require('./test.csv')
// const CSV = require('./csv.js')

// const stream = parse({ headers: true, skipRows: 2 })
//     .on('error', error => console.error(error))
//     .on('data', row => console.log(row))
//     .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

// parseStream('test.csv')
//     .on('error', error => console.error(error))
//     .on('data', row => console.log(row))
//     .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));


// console.log(CSVToArray(test));

let sheetDimension = {width: 49, height: 97, safeBorder: 0.25}
let metricUnits = false
const toolDIAMETER = 0.375      // end mill diameter used to space panels
const toolGAP = 0.005           // gap + bit size = total space between panels
const targetFIT = 0.8           // minimum ratio of a good fit per sheet
const acceptedWASTE = 0.2       // maximum acceptable waste per sheet
const acceptedDEVIATION = 1.1   // maximum acceptable length in group from first panel
// const tallMinHEIGHT = sheetDimension.height * 0.2

// function panelsFromCSV (file) {
//     return CSV.parse(file)
// }

// console.log(panelsFromCSV(test));

class Panel {
    constructor(width, height, id) {
        this.id = id
        this.width = width + toolDIAMETER + toolGAP
        this.height = height + toolDIAMETER + toolGAP
        this.area = this.height * this.width
    }

}




const _lastOf = (array) =>  array[array.length - 1]
const _ascendingHeight = (a, b) => a.height != b.height ? a.height - b.height : a.width - b.width
const _descendingHeight = (a, b) => b.height != a.height ? b.height - a.height : b.width - a.width
const _ascendingWidth = (a, b) => a.width != b.width ? a.width - b.width : a.height - b.height
const _descendingWidth = (a, b) => b.width != a.width ? b.width - a.width : b.height - a.height
const getSubGroupWidth = (group) => group.reduce((total, panel) => total + panel.width, 0)
const getSubGroupHeight = (group) => group.reduce((max, panel) => Math.max(max, panel.height), group[0].height)
const getGroupWidth = (group) => group.reduce((max, panel) => Math.max(max, panel.width), group[0].width)
const getGroupHeight = (group) => group.reduce((total, panel) => total + panel.height, 0)
const getGroupArea = (group) => group.reduce((total, panel) => total + panel.area, 0)
const getPanelArea = (group) => getGroupWidth(group) * sheetDimension.height
const remainingWidth = (group, maxWidth) => maxWidth - getGroupWidth(group)
const remainingHeight = (group) => sheetDimension.height - getGroupHeight(group)
const remainingFitHeight = (panels, forGroup) => panels.filter(panel => !panel.placed)
                                           .filter(panel => panel.height < remainingHeight(forGroup))
const remainingFitWidth = (panels, forGroup) => panels.filter(panel => !panel.placed)
                                           .filter(panel => panel.width < remainingWidth(forGroup))


const tall = [
    { width: 12, height: 23, id: 1.1, placed: false, area: 276 },
    { width: 12, height: 23, id: 1.2, placed: false, area: 276 },
    { width: 24, height: 23, id: 2, placed: false, area: 552 },
    { width: 11.3, height: 80, id: 1, placed: false, area: 904 },
    { width: 12, height: 6, id: 3, placed: false, area: 72 },
    {
      width: 12.2,
      height: 6,
      id: 3.1,
      placed: false,
      area: 73.19999999999999
    },
    { width: 12, height: 13, id: 4, placed: false, area: 156 },
    { width: 12, height: 15, id: 4.5, placed: false, area: 180 },
    { width: 12, height: 6, id: 3, placed: false, area: 72 },
    { width: 22, height: 6, id: 3.1, placed: false, area: 132 },
    { width: 12, height: 13, id: 4, placed: false, area: 156 },
    { width: 22, height: 13, id: 4.5, placed: false, area: 286 },
    { width: 11, height: 10, id: 5, placed: false, area: 110 },
    { width: 24, height: 75, id: 2, placed: false, area: 1800 }
  ]


const findMatchHeight = (panels, group) => {
    const shortPanel = (match) => (_lastOf(match) || sheetDimension).height
    let matches = [...panels].filter(panel => !panel.placed)
                           .filter(panel => panel.width <= getGroupWidth(group) * acceptedDEVIATION)
                           .filter(panel => panel.height < remainingHeight(group))
                           .sort(_descendingHeight)
    while (remainingHeight(group) > shortPanel(matches)) {
        matches[0].placed = true
        group = [...group, findMatchWidth(panels, [matches[0]], getGroupWidth(group))]
        // console.log("g",group);
        matches = remainingFitHeight(matches, group)
    }
    return group
}

const findMatchWidth = (panels, group, maxWidth) => {
    const shortPanel = (match) => (_lastOf(match) || sheetDimension).width
    let matches = [...panels].filter(panel => !panel.placed)
                           .filter(panel => panel.height <= getGroupHeight(group) * acceptedDEVIATION)
                           .filter(panel => panel.width <= remainingWidth(group, maxWidth))
                           .sort(_descendingWidth)
    if (!matches[0]) return group[0]
    while (remainingWidth(group, maxWidth) >= shortPanel(matches)) {
        matches[0].placed = true
        group = [...group, matches[0]]
        matches = remainingFitWidth(matches, group)
    }
    return {group: group,
            width: getSubGroupWidth(group),
            height: getSubGroupHeight(group),
            area: getGroupArea(group),
            // id: "subgroup",
            placed: true}
}

const sheetHeightGroups = (panels) => {

    return [...panels].sort(_descendingHeight)
                      .map(panel => {
                        if (!panel.placed) {
                            panel.placed = true
                            return findMatchHeight(panels, [panel])
                        }})
                      .filter(panel => panel) // remove empty arrays
                      .map((grouped, index) => ({
                          group: grouped,
                          width: getGroupWidth(grouped),
                          height: getGroupHeight(grouped),
                          area:  getGroupArea(grouped),
                        //   panel_area:  getPanelArea(grouped),
                        //   waste_area:  getPanelArea(grouped) - getGroupArea(grouped),
                        //   waste_ratio: 1 - getGroupArea(grouped) / getPanelArea(grouped),
                        //   id: index,
                          placed: false
                      }))

}

const placeGroupsOnSheet = (panels) => {
    const groups = sheetHeightGroups(panels)
    // console.log(groups);
    return groups.sort(_descendingWidth)
                      .map(group => {
                        if (!group.placed) {
                            group.placed = true
                            return findMatchWidth(groups, [group], sheetDimension.width)
                        }})
                      .filter(panel => panel) // remove empty arrays
                      .map((panels, index) => ({
                          group: panels,
                        //   width: getSubGroupWidth(panels),
                        //   height: getGroupHeight(panels),
                        //   sheet_area:  getPanelArea(panels),
                        //   panels_area:  getGroupArea(panels),
                        //   waste_area:  getPanelArea(panels) - getGroupArea(panels),
                        //   waste_ratio: 1 - getGroupArea(panels) / getPanelArea(panels),
                          //   fitness: fitnessScore()
                          sheet: index + 1,
                      }))

}




let x = placeGroupsOnSheet(tall)
// x = sheetHeightGroups(tall)


console.log("tall", x)
// console.log(x.map(i => i.group))
// console.log(x[0].group.group[1].group)
// console.log(tall.map(i => ({
//     id: i.id,
//     height: i.height,
//     width: i.width,
//     area: i.area,
//     placed: i.placed
// })));

const getPlacedArray = (placedObject) => placedObject.map(sheet => ({
    sheet: sheet.sheet,
    panels: sheet.group
}))


const extractArrays = (object) => {
    while (object.hasOwnProperty('group'))  {

    }
}
