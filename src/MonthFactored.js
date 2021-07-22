class MonthFactored extends Utils {
  static getActual () {
    const date = this.getLocaleDate();
    const yyyy = date.getFullYear();
    const financial_year = getConstProperties_('financial_year');

    if (yyyy === financial_year) return date.getMonth() + 1;
    else if (yyyy < financial_year) return 0;
    else return 12;
  }

  static getActive () {
    const date = (this.date || this.getLocaleDate());
    const yyyy = date.getFullYear();
    const financial_year = (this.financial_year || getConstProperties_('financial_year'));
    const initial_month = getUserSettings_('initial_month') + 1;

    let mm = 0;

    if (yyyy === financial_year) mm = date.getMonth() + 1;
    else if (yyyy < financial_year) mm = 0;
    else mm = 12;

    return initial_month > mm ? 0 : mm - initial_month + 1;
  }

  static getMFactor () {
    const date = (this.date = this.getLocaleDate());
    const yyyy = date.getFullYear();
    const financial_year = (this.financial_year = getConstProperties_('financial_year'));

    let mm = this.getActive();

    if (yyyy === financial_year) return --mm > 0 ? mm : 0;
    else if (yyyy < financial_year) return 0;
    else return mm;
  }
}
