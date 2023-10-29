/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function playQuickstart (id) {
  if (!Addon.isInstalled()) return

  const channel = id.match(/([a-z_]+)(\d+)/)
  if (!channel) {
    console.warn('playQuickstart(): No match found.', id)
    return
  }

  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(200)) return

  const name = channel[1]
  const num = Number(channel[2])

  QuickstartPl.ay(name, num)

  lock.releaseLock()
}
