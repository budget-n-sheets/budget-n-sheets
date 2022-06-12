class HtmlService2 {
  static createTemplateFromFile (path) {
    const htmlTemplate = HtmlService.createTemplateFromFile(path);
    return new HtmlTemplate2(htmlTemplate);
  }

  static htmlInclude (fileName) {
    return HtmlService.createTemplateFromFile(fileName).evaluate().getContent();
  }
}
