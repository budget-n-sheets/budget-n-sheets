const CONST_DATE = new Date();

class Consts {
  static get date () {
    return CONST_DATE;
  }

  static get month_name () {
    return {
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
  }
}
