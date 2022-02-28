class DriveFile {
  constructor (fileId) {
    this.file = DriveApp.getFileById(fileId);
    this.metadata = {
      id: fileId,
      owner: this.file.getOwner()
    };

    if (this.metadata.owner.getEmail() !== Session.getEffectiveUser().getEmail()) throw new Error('DriveFile: not owner, permission denied.');
  }

  asSpreadsheet () {
    if (this.file.getMimeType() !== MimeType.GOOGLE_SHEETS) throw new Error('DriveFile: asSpreadsheet(): File is not a Google Sheet.');
    return SpreadsheetApp.openById(this.metadata.id);
  }

  getId () {
    return this.metadata.id;
  }

  getName () {
    return this.file.getName();
  }
}
