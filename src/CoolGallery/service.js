function coolGalleryService (payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (payload.job) {
    case 'get':
      CoolGalleryService.getCoolTemplate(payload.id);
      break;
    case 'list':
      return CoolGalleryMetadata.getAll();

    default:
      console.error('coolGalleryService(): Switch case is default.', payload.job);
      return 1;
  }
}
