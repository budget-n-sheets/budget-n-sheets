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
