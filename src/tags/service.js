function tagsService (job, payload) {
  switch (job) {
    case 'get':
      return TagsService.getCategories();
    case 'save':
      TagsService.setCategories(payload);
      break;

    default:
      throw new Error('tagsService(): Switch case is default.');
  }
}
