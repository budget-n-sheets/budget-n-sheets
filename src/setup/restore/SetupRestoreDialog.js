class SetupRestoreDialog extends RestoreDialog {
  constructor (uuid) {
    super('restore', uuid, 'setup/restore/htmlSetupRestore');
  }

  evalStatus_ (status) {
    switch (status) {
      case 1:
        this._scriptlet.status_msg = 'Sorry, it was not possible to verify the backup.';
        break;
      case 2:
        this._scriptlet.status_msg = 'No file with the given ID could be found, or you do not have permission to access it.';
        break;
      case 3:
        this._scriptlet.status_msg = 'The password is incorrect or the file is corrupted.';
        break;

      default:
        this._scriptlet.status_msg = 'Sorry, something went wrong. Try again in a moment.';
        break;
    }
  }
}
