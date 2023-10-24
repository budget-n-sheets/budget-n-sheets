/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Utils {
  static getMonthDelta (mm) {
    if (mm == null) mm = LocaleUtils.getDate().getMonth()

    switch (mm) {
      case 0:
        return [0, 3]
      case 1:
        return [-1, 2]
      case 11:
        return [-3, 0]

      default:
        return [-2, 1]
    }
  }

  static getTranslation (description) {
    const translation = { type: '', number: 0, signal: 1 }

    const match = description.match(/(-?)@(M(\+|-)(\d+)|Avg|Total)/)
    if (!match) return null

    translation.signal = (match[1] === '-' ? -1 : 1)

    if (match[2] === 'Total' || match[2] === 'Avg') {
      translation.type = match[2]
    } else {
      translation.type = 'M'
      translation.number = Number(match[3] + match[4])
    }

    return translation
  }

  static deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  static toHexString (byteArray) {
    return Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2)
    }).join('')
  }

  static transpose (m) {
    return m[0].map((x, i) => m.map(x => x[i]))
  }

  static sliceBlankRows (table) {
    let n = table.length

    while (--n > -1) {
      if (table[n].findIndex(e => e !== '') > -1) break
    }

    n++
    return n > 0 ? table.slice(0, n) : []
  }
}
