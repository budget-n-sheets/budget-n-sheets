function getMonthFactored_ (select) {
  const date = getLocaleDate();
  let yyyy, mm;

  const financial_year = getConstProperties_('financial_year');

  if (select === 'actual_month') {
    yyyy = date.getFullYear();

    if (yyyy === financial_year) return date.getMonth() + 1;
    else if (yyyy < financial_year) return 0;
    else return 12;
  } else if (select === 'active_months') {
    if (date.getFullYear() === financial_year) mm = date.getMonth() + 1;
    else if (date.getFullYear() < financial_year) mm = 0;
    else mm = 12;

    const initial_month = getUserSettings_('initial_month') + 1;

    if (initial_month > mm) return 0;
    else return (mm - initial_month + 1);
  } else if (select === 'm_factor') {
    yyyy = date.getFullYear();
    mm = getMonthFactored_('active_months');

    if (yyyy === financial_year) {
      mm--;
      if (mm > 0) return mm;
      else return 0;
    } else if (yyyy < financial_year) {
      return 0;
    } else {
      return mm;
    }
  } else {
    ConsoleLog.error('getMonthFactored_(): Switch case is default.', select);
  }
}
