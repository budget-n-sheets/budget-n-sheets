function coolGalleryService (job, id) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (job) {
    case 'get':
      new CoolGalleryService(id).install();
      break;
    case 'list':
      return CoolGalleryService.getAvailableTemplates();

    default:
      console.error('coolGalleryService(): Switch case is default.');
      break;
  }
}
