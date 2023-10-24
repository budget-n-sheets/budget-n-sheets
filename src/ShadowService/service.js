/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function returnToShadow (uuid, password) {
  if (typeof password !== 'string') return

  let shadow
  try {
    shadow = SessionService.withUser().getSession(uuid)
  } catch (err) {
    LogLog.error(err)
    showSessionExpired()
    return
  }

  const callbackFunction = shadow.getProperty('callbackFunction')
  const callbackUuid = shadow.getProperty('callbackUuid')
  const param = shadow.getProperty('parameter')
  shadow.end()

  if (!this[callbackFunction]) {
    LogLog.error(`returnToShadow(): Callback function ${callbackFunction} is undefined.`)
    showDialogErrorMessage()
    return
  }

  if (!callbackFunction || !callbackUuid) {
    showSessionExpired()
    return
  }

  this[callbackFunction](callbackUuid, password, param)
}
