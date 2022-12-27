/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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

function callbackToPicker (uuid, fileId) {
  if (typeof fileId !== 'string') return;

  let picker;
  try {
    picker = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  const callbackFunction = picker.retrieveContext(['callback', 'function']);
  const callbackUuid = picker.retrieveContext(['callback', 'uuid']);
  const param = picker.retrieveContext(['parameter']);
  picker.end();

  if (!this[callbackFunction]) {
    LogLog.error(`callbackToPicker(): Callback function ${callbackFunction} is undefined.`);
    showDialogErrorMessage();
    return;
  }

  if (!callbackFunction || !callbackUuid) {
    showSessionExpired();
    return;
  }

  this[callbackFunction](callbackUuid, fileId, param);
}

function fallbackToPicker (uuid) {
  let picker;
  try {
    picker = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  const fallbackFunction = picker.retrieveContext(['fallback', 'function']);
  const callbackUuid = picker.retrieveContext(['callback', 'uuid']);
  picker.end();

  if (!this[fallbackFunction]) {
    LogLog.error(`fallbackToPicker(): Fallback function ${fallbackFunction} is undefined.`);
    showDialogErrorMessage();
    return;
  }

  if (!fallbackFunction || !callbackUuid) {
    showSessionExpired();
    return;
  }

  this[fallbackFunction](callbackUuid);
}
