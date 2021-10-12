function getUserSettings () {
  if (!User2.isAdmin()) return;
  return UserSettings.getSettings();
}

function saveUserSettings (settings) {
  if (!User2.isAdmin()) return 1;
  new UserSettings().saveSidebarSettings(settings).flush();
}
