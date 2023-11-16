/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
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
  const k = 'apps-script-issue-69270374'
  const s = CacheService.getScriptCache()
  return s.get(k) ??
    (function(s, k) {
      const p = 'apps-script/known-errors/issue-69270374/workaround'
      const h = HtmlService.createHtmlOutputFromFile(`${p}/htmlNotice`).getContent()
      const t = HtmlService.createTemplateFromFile(`${p}/jsTest`)
      t.htmlNotice = h
      const c = t.evaluate().getContent()
      s.put(k, c)
      return c
    })(s, k)
}

function appsScriptIssue69270374WorkaroundTest () {
  Session.getEffectiveUser().getEmail()
}
