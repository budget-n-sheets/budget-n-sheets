class HtmlPanel {
  constructor (htmlTemplate, jsTemplate) {
    this._htmlTemplate = htmlTemplate;
    this._jsTemplate = jsTemplate;
  }

  getHtmlContent () {
    return this._htmlTemplate.assignReservedHref()
      .evaluate()
      .getContent();
  }

  getJsContent () {
    return this._jsTemplate.assignReservedHref()
      .evaluate()
      .getContent();
  }
}
