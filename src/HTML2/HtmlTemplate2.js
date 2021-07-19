class HtmlTemplate2 {
  constructor (htmlTemplate) {
    this.htmlTemplate = htmlTemplate;
  }

  assignReservedHref () {
    for (const key in RESERVED_HREF) {
      this.htmlTemplate[key] = RESERVED_HREF[key];
    }

    return this;
  }

  evaluate () {
    return this.htmlTemplate.evaluate();
  }

  getRawContent () {
    return this.htmlTemplate.getRawContent();
  }

  setScriptletValues (values) {
    for (const key in values) {
      this.htmlTemplate[key] = values[key];
    }

    return this;
  }
}
