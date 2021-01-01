export function toFloat(str) {
  const float4 = (str) => parseFloat(parseFloat(str).toFixed(4))
  if (!isNaN(str)) return float4(str) // if number return float
  if (str.includes('/') && !str.includes('.')) {
    return str
      .split(' ') // covert rational string into array
      .filter((item) => item !== '') // removes multiple spaces
      .reduce((total, item) => {
        // get array total of whole # + fraction
        if (item.includes('/')) {
          let frac = item.split('/').filter((item) => item !== '')
          return total + float4(frac[0] / frac[1])
        }
        return total + float4(item)
      }, 0)
  }
  return str
}

export function hasNumber(str) {
  return /\d/.test(str)
}
export function isNumber(str) {
  return /(\.|\/)\d/.test(str)
}

const removeFromArray = (array, itemValue) => {
  let index = array.indexOf(itemValue)
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function trunc(number, places) {
  return parseInt(number * 10 ** places) / 10 ** places
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

  return format.replace(/mm|dd|yy|yyyy|H|M|S/gi, (matched) => map[matched])
}
