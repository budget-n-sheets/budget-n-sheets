/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class AddonUser {
  static getAccessLevel () {
    const id = SpreadsheetApp2.getActive().getId()
    const permission = new DriveFile(id).getUserPermission()
    return DriveRoles.getRoleLevel(permission.role)
  }

  static hasBaselinePermission () {
    try {
      return this.getAccessLevel() <= 2
    } catch (err) {
      return false
    }
  }
}
