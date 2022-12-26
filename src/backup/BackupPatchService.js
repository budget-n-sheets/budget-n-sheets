/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BackupPatchService {
  static patchThis (backup) {
    if (backup) {
      const service = new BackupPatch(backup).run();
      if (service.response === 0) return service.payload;
    }

    return null;
  }
}
