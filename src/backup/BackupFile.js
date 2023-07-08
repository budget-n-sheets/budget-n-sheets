/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BackupFile extends DriveFile {
  constructor (fileId) {
    super(fileId);

    const permission = this.getUserPermission()
    if (DriveRoles.getRoleLevel(permission.role) > 2) throw new Error("You don't have enough permission to access this file.")

    this.data = this.file.getBlob().getDataAsString();
    this.metadata.isLegacyFormat = /:[0-9a-fA-F]{40}$/.test(this.data);
  }
}
