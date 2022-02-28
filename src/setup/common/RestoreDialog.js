class RestoreDialog extends HtmlTemplate2 {
  constructor (protocol, uuid, path) {
    const htmlTemplate = HtmlService.createTemplateFromFile(path);
    super(htmlTemplate);

    this.protocol = protocol;
    this._scriptlet = {
      uuid: uuid,
      isContinued: false,
      status_msg: ''
    };
  }

  evalLastStatus_ () {
    const lock = LockService.getDocumentLock();
    if (!lock.tryLock(200)) {
      this._scriptlet.status_msg = 'Sorry, something went wrong. Try again in a moment.';
      return;
    }

    const status = SessionService.getSession(this._scriptlet.uuid).retrieveContext(['setup', this.protocol]);

    lock.releaseLock();

    if (status == null) return;
    else if (status === 0) this._scriptlet.isContinued = true;
    else this.evalStatus_(status);
  }

  loadCommon_ () {
    const dialogCommon = new RestoreDialogCommon(this.protocol);

    this.htmlTemplate.htmlCommonDialog = dialogCommon.getHtmlContent();
    this.htmlTemplate.jsCommonDialog = dialogCommon.getJsContent();
  }

  build () {
    this.evalLastStatus_();
    this.loadCommon_();

    return this.assignReservedHref()
      .setScriptletValues(this._scriptlet)
      .evaluate()
      .setWidth(353)
      .setHeight(359);
  }
}
