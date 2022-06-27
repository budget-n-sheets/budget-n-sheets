class CoolGalleryMetadata {
  static get filter_by_tag () {
    return {
      template_id: '',
      version_name: 'v0.3.0',
      name: 'Filter by Tag',
      description: 'Filter and sort transactions by a selected tag.',
      sheets: ['Filter by Tag']
    };
  }

  // static get stats_for_tags () {
  //   return {
  //     template_id: '',
  //     version_name: 'v1.0.1',
  //     name: 'Stats for Tags',
  //     description: 'Basic statistics for your tags.',
  //     sheets: ['Stats for Tags']
  //   };
  // }

  static getAll () {
    return {
      filter_by_tag: this.filter_by_tag
      // stats_for_tags: this.stats_for_tags
    };
  }
}
