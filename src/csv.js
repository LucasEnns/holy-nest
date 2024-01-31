import { csvTemplate, defaultSettings } from './stores.js'
import { hasNumber, toFloat } from './helperFunctions.js'

export function CSVToArray(csv, headerRows = 0) {
  csv.replace('\r\n', '\n').replace('\r', '\n')

  const ROW_END = '\n',
    COLUMN_END = ','

  let array = csv
    .split(ROW_END)
    .map((column) =>
      column
        .split(COLUMN_END)
        .map((cell) => (hasNumber(cell) ? toFloat(cell) : cell))
    )

  checkHeaderValidity()

  return array.filter((v, i) => {
    if (i < headerRows) return true
    return v.filter((cell) => cell !== '').length
  })

  function checkHeaderValidity() {
    if (
      array[0][0] == csvTemplate.en[0][0] ||
      array[0][0] == csvTemplate.fr[0][0]
    ) {
      return
    }

    const headers = csvTemplate[defaultSettings.language].slice(0, -1)

    if (typeof array[0][2] == 'number') {
      array = [...headers, ...array]
    }

    if (typeof array[0][2] == 'string' && typeof array[1][2] == 'number') {
      array = [...headers, ...array.slice(1)]
    }
  }
}
