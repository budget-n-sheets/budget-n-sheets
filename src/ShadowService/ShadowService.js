class ShadowService extends Pushback {
  constructor (uuid) {
    if (!SessionService.hasSession(uuid)) throw new Error('Session expired.');
    super();
    this._session.createContext(['callback', 'uuid'], uuid);
  }

  showDialog () {
    this.config_();

    const htmlOutput = HtmlService2.createTemplateFromFile('ShadowService/htmlShadowDialog')
      .setScriptletValues({ uuid: this._uuid })
      .evaluate()
      .setWidth(307)
      .setHeight(89);

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
  }
}
