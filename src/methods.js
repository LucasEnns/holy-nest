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


export function trunc ( number, places ) {
    return parseInt( number * ( 10 ** places ) ) / ( 10 ** places )
}


export function formatDate(date, format) {
    const map = {
        mm: date.getMonth() + 1,
        dd: date.getDate(),
        yy: date.getFullYear().toString().slice(-2),
        yyyy: date.getFullYear(),
        H: date.getHours(),
        M: date.getMinutes(),
        S: date.getSeconds(),
    }

    return format.replace(/mm|dd|yy|yyyy|H|M|S/gi, matched => map[matched])
}
