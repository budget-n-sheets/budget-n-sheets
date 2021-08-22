function coolGalleryService (payload) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return;
  }

  switch (payload.job) {
    case 'list':
      return CoolGalleryMetadata.getAll();

    default:
      console.error('coolGalleryService(): Switch case is default.', payload.job);
      return 1;
  }
}
