function toFloat( str ) {
    if (!isNaN(str)) return parseFloat(str) // if number return float
    if (str.includes("/") && !str.includes(".")) {
        return str
            .split(" ")
            .filter(item => item !== "") // for multiple spaces
            .reduce( ( total, item ) => {
                if ( item.includes("/") ) {
                    let frac = item.split("/").filter(item => item !== "")
                    return total + parseFloat(frac[0] / frac[1])}
                return total + parseFloat(item)
                }, 0 )
    }
    return "error"
}


const removeFromArray = (array, itemValue) =>{
    let index = array.indexOf(itemValue)
    return [...array.slice(0, index), ...array.slice(index + 1)]
}

console.log(toFloat("16       3//8  "));
