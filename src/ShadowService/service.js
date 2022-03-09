function returnToShadow (uuid, password) {
  if (typeof password !== 'string') return;

  let shadow;
  try {
    shadow = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  const callbackFunction = shadow.retrieveContext(['callback', 'function']);
  const callbackUuid = shadow.retrieveContext(['callback', 'uuid']);
  const param = shadow.retrieveContext(['parameter']);
  shadow.end();

  if (!this[callbackFunction]) {
    LogLog.error(`returnToShadow(): Callback function ${callbackFunction} is undefined.`);
    showDialogErrorMessage();
    return;
  }

  if (!callbackFunction || !callbackUuid) {
    showSessionExpired();
    return;
  }

  this[callbackFunction](callbackUuid, password, param);
}
