class BackupFile extends DriveFile {
  constructor (fileId) {
    super(fileId);

    this.data = this.file.getBlob().getDataAsString();
    this.metadata.isLegacyFormat = /:[0-9a-fA-F]{40}$/.test(this.data);
  }
}
