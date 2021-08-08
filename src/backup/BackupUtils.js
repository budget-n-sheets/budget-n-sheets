class BackupUtils {
  static checkPasswordPolicy (password) {
    if (typeof password !== 'string') return false;
    if (password.length < 12) return false;
    if (!/[a-z]+/.test(password)) return false;
    if (!/[A-Z]+/.test(password)) return false;
    if (!/[0-9]+/.test(password)) return false;
    if (!/[~!@#$%^*\-_=+[{\]}/;:,.?]+/.test(password)) return false;
    if (!/^[0-9a-zA-Z~!@#$%^*\-_=+[{\]}/;:,.?]{12,}$/.test(password)) return false;

    return true;
  }

  static sendEmail (blob) {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const scriptlet = {
      spreadsheet_url: spreadsheet.getUrl(),
      spreadsheet_name: spreadsheet.getName(),
      time: DATE_NOW
    };

    const htmlMessage = HtmlService2.createTemplateFromFile('backup/htmlBackupEmail')
      .assignReservedHref()
      .setScriptletValues(scriptlet)
      .evaluate()
      .getContent();

    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      'Your Budget n Sheets Backup',
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
