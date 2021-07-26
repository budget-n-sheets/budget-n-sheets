function getConstProperties_ (select) {
  const const_properties = CachedAccess.get('const_properties');

  switch (select) {
    case 'financial_year':
    case 'number_accounts':
    case 'date_created':
      return const_properties[select];

    default:
      ConsoleLog.error('getConstProperties_(): Switch case is default.', select);
      break;
  }
}
