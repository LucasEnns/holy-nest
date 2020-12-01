export const toDECIMAL = str => {
    if (!isNaN(str)) return parseFloat(str)
    if (str.includes("/") && !str.includes(".")) {
        let whole = 0, fraction = str.split("/")
        if (str.includes(" ")) {
            whole = parseFloat(str.split(" ")[0])
            fraction[0] = fraction[0].split(" ")[1]
        }
        return whole + parseFloat(fraction[0] / fraction[1])
    }
    return "error"
}


const removeFromArray = (array, itemValue) =>{
    let index = array.indexOf(itemValue)
    return [...array.slice(0, index), ...array.slice(index + 1)]
}
