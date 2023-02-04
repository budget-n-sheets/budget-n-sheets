/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Pushback {
  constructor () {
    this._session = SessionService.withUser().startSession();
    this._param = {};
  }

  get _uuid () {
    return this._session.getUuid();
  }

  config_ () {
    if (!this._callbackFunction) throw new Error('Undefined callback.');

    this._session.setProperty('callbackFunction', this._callbackFunction);
    this._session.setProperty('parameter', this._param);
  }

  setCallbackFunction (callbackFunctionName) {
    this._callbackFunction = callbackFunctionName;
    return this;
  }

  setParam (name, value) {
    this._param[name] = value;
    return this;
  }
}
