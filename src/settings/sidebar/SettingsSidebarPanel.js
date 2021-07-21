class SettingsSidebarPanel {
  constructor (htmlTemplate, jsTemplate) {
    this._htmlTemplate = htmlTemplate;
    this._jsTemplate = jsTemplate;
  }

  getHtmlContent () {
    return this._htmlTemplate.evaluate().getContent();
  }

  getJsContent () {
    return this._jsTemplate.evaluate().getContent();
  }
}
