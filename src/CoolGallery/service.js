function coolGalleryService (job, id) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (job) {
    case 'get':
      CoolGalleryService.getCoolTemplate(id);
      break;
    case 'list':
      return {
        filter_by_tag: CoolFilterByTag.metadata
        // stats_for_tags: CoolStatsForTags.metadata
      };

    default:
      console.error('coolGalleryService(): Switch case is default.');
      break;
  }
}
