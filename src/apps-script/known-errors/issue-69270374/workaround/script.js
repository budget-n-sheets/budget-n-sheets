/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

/**
 * https://www.budgetnsheets.com/support/known-issues/apps-script-issue-69270374
 */

function appsScriptIssue69270374WorkaroundFrame () {
  const htmlNotice = HtmlService2.createTemplateFromFile('apps-script/known-errors/issue-69270374/workaround/htmlNotice')
    .setScriptletValues(HtmlResources.href.reserved)
    .evaluate()
    .getContent();

  return HtmlService2.createTemplateFromFile('apps-script/known-errors/issue-69270374/workaround/jsTest')
    .setScriptletValues({ htmlNotice: htmlNotice })
    .evaluate()
    .getContent();
}

function appsScriptIssue69270374WorkaroundTest () {
  Session.getEffectiveUser().getEmail();
}
