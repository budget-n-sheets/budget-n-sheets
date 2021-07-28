function getUserSettings_ (select) {
  const user_settings = CachedAccess.get('user_settings');

  switch (select) {
    case 'financial_calendar':
    case 'post_day_events':
    case 'override_zero':
    case 'cash_flow_events':
    case 'initial_month':
    case 'optimize_load':
      return user_settings[select];

    default:
      console.error('getUserSettings_(): Switch case is default.', select);
      break;
  }
}

function setUserSettings_ (select, value) {
  const user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');

  switch (select) {
    case 'initial_month':
    case 'financial_calendar':
    case 'post_day_events':
    case 'cash_flow_events':
    case 'override_zero':
    case 'optimize_load':
      user_settings[select] = value;
      break;

    default:
      console.error('setUserSettings_() : Switch case is default.', select);
      return false;
  }

  CachedAccess.update('user_settings', user_settings);
  updateSettingsMetadata_(user_settings);

  return true;
}
