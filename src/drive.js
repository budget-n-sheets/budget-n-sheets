/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken () {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

function isUserOwner (fileId) {
  let file;

  try {
    file = DriveApp.getFileById(fileId);
  } catch (err) {
    console.error(err);
    return false;
  }

  return file.getOwner().getEmail() === Session.getEffectiveUser().getEmail();
}
