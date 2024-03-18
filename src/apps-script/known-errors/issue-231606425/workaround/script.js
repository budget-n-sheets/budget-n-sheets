/**
 * Budget n Sheets Copyright 2017-2024 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

/**
 * https://issuetracker.google.com/issues/231606425
 */

class AppsScriptIssue231606425Workaround {
  static getTemporaryActiveUserKey () {
    const cached = CachedProperties.withUser()
    let tkey = cached.get('temporary_active_user_key')

    if (!tkey) {
      tkey = {
        time: new Date().getTime(),
        key: Session.getTemporaryActiveUserKey(),
      }

      cached.update('temporary_active_user_key', tkey)
    } else {
      const thirdyDays = 2592000000 // 30 * 24 * 60 * 60 * 1000
      const delta = new Date().getTime() - tkey.time
      const next = Session.getTemporaryActiveUserKey()

      if (delta > thirdyDays && tkey.key !== next) {
        tkey = {
          time: new Date().getTime(),
          key: next,
        }

        cached.update('temporary_active_user_key', tkey)
      }
    }

    return `${tkey.key}`
  }
}
