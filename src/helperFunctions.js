export function toFloat(str) {
  if (!isNaN(str)) return cleanFloat(str)
  if (str.includes('/') && !str.includes('.')) {
    return str
      .split(' ')
      .filter((item) => item !== '')
      .reduce((total, item) => {
        if (item.includes('/')) {
          let frac = item.split('/').filter((item) => item !== '')
          return total + cleanFloat(frac[0] / frac[1])
        }
        return total + cleanFloat(item)
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
export function trunc(number, places) {
  return Math.round(parseFloat(number) * 10 ** places) / 10 ** places
}
export function cleanFloat(num, trailing = 5) {
  return trunc(num, trailing)
}
const removeFromArray = (array, itemValue) => {
  let index = array.indexOf(itemValue)
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function toMM(number) {
  return cleanFloat(number * 25.4, 3)
}

export function toInches(number) {
  return cleanFloat(number / 25.4)
}

export function formatDate(date, format) {
  const leadingZero = (digits) => ('0' + digits).slice(-2)
  const map = {
    mm: leadingZero(date.getMonth() + 1),
    dd: leadingZero(date.getDate()),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear(),
    HH: leadingZero(date.getHours()),
    MM: leadingZero(date.getMinutes()),
    SS: leadingZero(date.getSeconds()),
    T: 'T',
    h: 'h',
  }

  return format.replace(/mm|dd|yyyy|yy|HH|MM|SS/gi, (matched) => map[matched])
}
