class SetupCopyDialog extends HtmlTemplate2 {
  constructor (uuid) {
    const htmlTemplate = HtmlService.createTemplateFromFile('setup/restore/htmlSetupCopy');
    super(htmlTemplate);

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

    const address = Utilities2.computeDigest('SHA_1', ['setup_status', this._scriptlet.uuid, 'copy'].join(':'), 'UTF_8');
    const status = CacheService3.document().get(address);
    CacheService3.document().remove(address);

    lock.releaseLock();

    if (status == null) return;

    switch (status) {
      case 0:
        this._scriptlet.isContinued = true;
        break;
      case 1:
        this._scriptlet.status_msg = 'Sorry, it was not possible to verify the spreadsheet.';
        break;
      case 2:
        this._scriptlet.status_msg = 'No spreadsheet with the given ID could be found, or you do not have permission to access it.';
        break;

      default:
        this._scriptlet.status_msg = 'Sorry, something went wrong. Try again in a moment.';
        break;
    }
  }

  loadCommon_ () {
    const setupRestoreCommon = new SetupRestoreCommon();

    this.htmlTemplate.htmlSetupRestoreCommon = setupRestoreCommon.getHtmlContent();
    this.htmlTemplate.jsSetupRestoreCommon = setupRestoreCommon.getJsContent();
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
