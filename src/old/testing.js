// const _lastOf = (array) =>  array[array.length - 1]

// console.log([][0])




// const setTallestGroups = (panels) => {
//     let tallGroups = []
//     let tallPanels = panels.filter(p => p.height >= tallMinHEIGHT)
//     // const tallEnough = (panel) => panel.height > sheetDimension.height - acceptedWASTE

//     tallPanels.sort(_descendingHeight)
//               .map(tallPanel => {
//                     tallPanel.placed = true
//                     tallGroups .push( findMatch( [tallPanel]) )
//                     console.log(remainingHeight(_lastOf(tallGroups)));
//                 })
//     return tallGroups
// }





// const findMatch = (panels, group) => {
//     const shortPanel = (match) => (_lastOf(match) || sheetDimension).height
//     let matches = [...panels].filter(panel => !panel.placed)
//                            .filter(panel => panel.width <= getGroupWidth(group) * acceptedDEVIATION)
//                            .filter(panel => panel.height < remainingHeight(group))
//                            .sort(_descendingHeight)
//     while (remainingHeight(group) > shortPanel(matches)) {
//         matches[0].placed = true
//         group = [...group, matches[0]]
//         matches = remainingFitHeight(matches, group)
//     }
//     return group
// }



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



let sheetDimension = {width: 49, height: 97, safeBorder: 0.25}
let metricUnits = false
const toolDIAMETER = 0.375      // end mill diameter used to space panels
const toolGAP = 0.005           // gap + bit size = total space between panels
const targetFIT = 0.8           // minimum ratio of a good fit per sheet
const acceptedWASTE = 0.2       // maximum acceptable waste per sheet
const acceptedDEVIATION = 1.1   // maximum acceptable length in group from first panel
// const tallMinHEIGHT = sheetDimension.height * 0.2


const _lastOf = (array) =>  array[array.length - 1]
const _ascendingHeight = (a, b) => a.height != b.height ? a.height - b.height : a.width - b.width
const _descendingHeight = (a, b) => b.height != a.height ? b.height - a.height : b.width - a.width
const _ascendingWidth = (a, b) => a.width != b.width ? a.width - b.width : a.height - b.height
const _descendingWidth = (a, b) => b.width != a.width ? b.width - a.width : b.height - a.height
const remainingWidth = (group, maxWidth) => maxWidth - getGroupWidth(group)
const remainingHeight = (group) => sheetDimension.height - getGroupHeight(group)
const getSubGroupWidth = (group) => group.reduce((total, panel) => total + panel.width, 0)
const getSubGroupHeight = (group) => group.reduce((max, panel) => Math.max(max, panel.height), group[0].height)
const getGroupWidth = (group) => group.reduce((max, panel) => Math.max(max, panel.width), group[0].width)
const getGroupHeight = (group) => group.reduce((total, panel) => total + panel.height, 0)
const getGroupArea = (group) => group.reduce((total, panel) => total + panel.area, 0)
const getPanelArea = (group) => getGroupWidth(group) * sheetDimension.height
const remainingFitHeight = (panels, forGroup) => panels.filter(panel => !panel.placed)
                                           .filter(panel => panel.height < remainingHeight(forGroup))
const remainingFitWidth = (panels, forGroup) => panels.filter(panel => !panel.placed)
                                           .filter(panel => panel.width < remainingWidth(forGroup))
// const placedSubGroup = (group) => ({
//     subgroup: group,
//     width: getSubGroupWidth(group),
//     height: getSubGroupHeight(group),
//     area: getGroupArea(group),
//     id: "subgroup",
//     placed: true
// })

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
    const subgroup = (match) => findMatchWidth(panels, [match], getGroupWidth(group))
    let matches = [...panels].filter(panel => !panel.placed)
                           .filter(panel => panel.width <= getGroupWidth(group) * acceptedDEVIATION)
                           .filter(panel => panel.height < remainingHeight(group))
                           .sort(_descendingHeight)
    while (remainingHeight(group) > shortPanel(matches)) {
        matches[0].placed = true
        if (!Array.isArray(subgroup(matches[0]))){
            group = [...group, matches[0]]
        } else {
            group = [...group, {
                subgroup: subgroup(matches[0]),
                width: getSubGroupWidth(group),
                height: getSubGroupHeight(group),
                area: getGroupArea(group),
                id: "subgroup",
                placed: true
            }]
        }
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
    return group
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
    console.log(groups);
    return groups.sort(_descendingWidth)
                      .map(group => {
                        if (!group.placed) {
                            group.placed = true
                            return findMatchWidth(groups, [group], sheetDimension.width)
                        }})
                      .filter(panel => panel) // remove empty arrays
                      .map((panels, index) => ({
                          placed: panels,
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




x = placeGroupsOnSheet(tall)
// x = sheetHeightGroups(tall)


console.log("tall", x)
// console.log(x.map(i => i.group))
// console.log(x.map(i => i.placed)[0].group)
// console.log(tall.map(i => ({
//     id: i.id,
//     height: i.height,
//     width: i.width,
//     area: i.area,
//     placed: i.placed
// })));


function addXCoordinates( columns, start = 0 ) {
    let xPos = new List()
    columns.forEach( ( column, i ) => {
        // map x0 to xPos on sheet, calculated by prev. width
        if ( i === 0 ) xPos.push( start )
        else xPos.push(xPos.last() + columns[i - 1].width)
        // add x0 prop to each row of column
        column.group.forEach( ( row ) => {
            if ( row instanceof Panel ) row.x0 = xPos[i]
            else {
                row.forEach(( rowCol, k ) => {
                    if ( k === 0 ) rowCol.x0 = xPos[i]
                    else rowCol.x0 = row[k-1].x0 + row[k-1].width
                })
            }
        })
    })
}
