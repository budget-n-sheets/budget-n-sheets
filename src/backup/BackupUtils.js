class BackupUtils {
  static checkPasswordPolicy (password) {
    if (typeof password !== 'string') return false;
    if (password.length < 8) return false;

    return true;
  }

  static sendEmail (blob) {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const scriptlet = {
      spreadsheet_url: spreadsheet.getUrl(),
      spreadsheet_name: spreadsheet.getName(),
      time: Consts.date
    };

    const htmlMessage = HtmlService2.createTemplateFromFile('backup/htmlBackupEmail')
      .assignReservedHref()
      .setScriptletValues(scriptlet)
      .evaluate()
      .getContent();

    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      'Your budget spreadsheet backup',
      htmlMessage,
      {
        name: 'Add-on Budget n Sheets',
        htmlBody: htmlMessage,
        noReply: true,
        attachments: [blob]
      }
    );
  }
}
