function coolGalleryService (payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (payload.job) {
    case 'get':
      CoolGalleryService.getCoolTemplate(payload.id);
      break;
    case 'list':
      return {
        filter_by_tag: CoolFilterByTag.metadata
        // stats_for_tags: CoolStatsForTags.metadata
      };

    default:
      console.error('coolGalleryService(): Switch case is default.', payload.job);
      return 1;
  }
}
