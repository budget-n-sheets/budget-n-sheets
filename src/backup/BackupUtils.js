/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BackupUtils {
  static checkPasswordPolicy (password) {
    if (typeof password !== 'string') return false
    if (password.length < 8) return false

    return true
  }

  static sendEmail (blob) {
    const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    const scriptlet = {
      spreadsheet_url: spreadsheet.getUrl(),
      spreadsheet_name: spreadsheet.getName(),
      time: Consts.date
    }

    const htmlMessage = HtmlService2.createTemplateFromFile('backup/htmlBackupEmail')
      .setScriptletValues(HtmlResources.href.reserved)
      .setScriptletValues(scriptlet)
      .evaluate()
      .getContent()

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
    )
  }
}
