class HtmlPanel {
  constructor (htmlTemplate, jsTemplate) {
    this._htmlTemplate = htmlTemplate;
    this._jsTemplate = jsTemplate;
  }

  getHtmlContent () {
    return this._htmlTemplate.setScriptletValues(HtmlResources.href.reserved)
      .evaluate()
      .getContent();
  }

  getJsContent () {
    return this._jsTemplate.setScriptletValues(HtmlResources.href.reserved)
      .evaluate()
      .getContent();
  }
}
