/*
 * https://www.budgetnsheets.com/support/known-issues/apps-script-issue-69270374
 * 8d4adafda11
 */

function containment8d4adafda11Frame () {
  const htmlNotice = HtmlService2.createTemplateFromFile('containment/apps-script-issue-69270374/htmlNotice')
    .setScriptletValues(HtmlResources.href.reserved)
    .evaluate()
    .getContent();

  return HtmlService2.createTemplateFromFile('containment/apps-script-issue-69270374/jsTest')
    .setScriptletValues({ htmlNotice: htmlNotice })
    .evaluate()
    .getContent();
}

function containment8d4adafda11Test () {
  Session.getEffectiveUser().getEmail();
}
