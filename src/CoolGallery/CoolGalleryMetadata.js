class CoolGalleryMetadata {
  static getFilterByTag () {
    return {
      id: '',
      version_name: 'v0.3.0',
      version_date: '2020-05-07',
      name: 'Filter by Tag',
      description: 'Filter and sort all trasactions by a selected tag.',
      sheet_name: 'Filter by Tag'
    };
  }

  static getStatsForTags () {
    return {
      id: '',
      preview_id: '',
      version_name: 'v1.0.1',
      version_date: '2020-02-25',
      name: 'Stats for Tags',
      description: 'View stats for your tags by month, category, and tags.',
      sheet_name: 'Stats for Tags'
    };
  }

  static getAll () {
    return {
      filter_by_tag: this.getFilterByTag(),
      stats_for_tags: this.getStatsForTags()
    };
  }
}
