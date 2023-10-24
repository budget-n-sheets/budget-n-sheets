/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MonthFactored {
  static getActual () {
    const date = LocaleUtils.getDate()
    const yyyy = date.getFullYear()
    const financial_year = SettingsConst.get('financial_year')

    if (yyyy === financial_year) return date.getMonth() + 1
    else if (yyyy < financial_year) return 0
    else return 12
  }

  static getActive () {
    const date = (this.date || LocaleUtils.getDate())
    const yyyy = date.getFullYear()
    const financial_year = (this.financial_year || SettingsConst.get('financial_year'))
    const initial_month = SettingsUser.get('initial_month') + 1

    let mm = 0

    if (yyyy === financial_year) mm = date.getMonth() + 1
    else if (yyyy < financial_year) mm = 0
    else mm = 12

    return initial_month > mm ? 0 : mm - initial_month + 1
  }

  static getMFactor () {
    const date = (this.date = LocaleUtils.getDate())
    const yyyy = date.getFullYear()
    const financial_year = (this.financial_year = SettingsConst.get('financial_year'))

    let mm = this.getActive()

    if (yyyy === financial_year) return --mm > 0 ? mm : 0
    else if (yyyy < financial_year) return 0
    else return mm
  }
}
