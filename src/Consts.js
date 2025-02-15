/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

const CONST_DATE = new Date()

class Consts {
  static get date () {
    return CONST_DATE
  }

  static get month_name () {
    return {
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  }

  static get color_palette () {
    return {
      whitesmoke: 'f5f5f5',
      slategray: '708090',
      black: '000000',
      darkblue: '00008b',
      slateblue: '6a5acd',
      lightskyblue: '87cefa',
      seagreen: '2e8b57',
      mediumseagreen: '3cb371',
      crimson: 'dc143c',
      deeppink: 'ff1493',
      darkorange: 'ff8c00',
      goldenrod: 'daa520'
    }
  }

  static get tags_categories () {
    return ['Food and supply', 'Shopping and clothing', 'Hobby', 'Leisure time', 'Home', 'Other', 'Health and insurance', 'Services', 'Transport', 'Traveling']
  }
}
