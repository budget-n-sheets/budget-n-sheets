function getConstProperties_ (select) {
  let const_properties;

  const_properties = CacheService2.get('document', 'const_properties', 'json');
  if (!const_properties) {
    const_properties = PropertiesService2.getProperty('document', 'const_properties', 'json');
    CacheService2.put('document', 'const_properties', 'json', const_properties);
  }

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
