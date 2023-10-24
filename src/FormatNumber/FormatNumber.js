/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatNumber {
  constructor () {
    const settings = SettingsSpreadsheet.getAll();

    this.dec_p = settings.decimal_places;
    this.dec_s = settings.decimal_separator ? '.' : ',';
    this.dec_t = (this.dec_s === '.' ? ',' : '.');
  }

  currency (number) {
    /** $ x,xx0.00;-$ x,xx0.00 */
    let n = number;

    const s = n < 0 ? '-$ ' : '$ ';

    n = Math.abs(+n || 0).toFixed(this.dec_p);
    const i = parseInt(n) + '';

    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    return s + (j ? i.substring(0, j) + this.dec_t : '') + i.substring(j).replace(/(\d{3})(?=\d)/g, '$1' + this.dec_t) + (this.dec_p > 0 ? this.dec_s + Math.abs(n - i).toFixed(this.dec_p).slice(2) : '');
  }

  financial (number) {
    /** x,xx0.00;(x,xx0.00) */
    let n = number;

    const s = n < 0;

    n = Math.abs(+n || 0).toFixed(this.dec_p);
    const i = parseInt(n) + '';

    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    let a = (j ? i.substring(0, j) + this.dec_t : '') + i.substring(j).replace(/(\d{3})(?=\d)/g, '$1' + this.dec_t) + (this.dec_p > 0 ? this.dec_s + Math.abs(n - i).toFixed(this.dec_p).slice(2) : '');

    if (s) a = '(' + a + ')';

    return a;
  }

  localeSignal (number) {
    /** +0.00;-0.00 */
    let n = number;

    const s = n < 0 ? '-' : '+';

    n = Math.abs(n).toFixed(this.dec_p);
    const i = parseInt(n) + '';

    const j = i.length;

    return s + i.substring(0, j) + (this.dec_p > 0 ? this.dec_s + Math.abs(n - i).toFixed(this.dec_p).slice(2) : '');
  }

  calendarSignal (number) {
    /** $0.00;-$0.00 */
    let n = number;

    const s = n < 0 ? '-$' : '$';

    n = Math.abs(n).toFixed(2);
    const i = parseInt(n) + '';

    const j = i.length;

    return s + i.substring(0, j) + (this.dec_p > 0 ? this.dec_s + Math.abs(n - i).toFixed(this.dec_p).slice(2) : '');
  }
}
