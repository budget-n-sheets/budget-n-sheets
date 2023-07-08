/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DriveRoles {
  static getRoleLevel (role) {
    switch (role) {
      case 'owner':
      case 'organizer':
        return 1
      case 'fileOrganizer':
        return 2
      case 'writer':
        return 4
      case 'reader':
        return 8

      default:
        return 8
    }
  }
}
