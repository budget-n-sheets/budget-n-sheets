class BackupPatchService {
  static patchThis (backup) {
    if (backup) {
      const service = new BackupPatch(backup).run();
      if (service.response === 0) return service.payload;
    }

    return null;
  }
}
