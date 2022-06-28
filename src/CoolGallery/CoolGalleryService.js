class CoolGalleryService {
  constructor (id = '') {
    this._cool = CoolGallery.getById(id);
    if (!this._cool) throw new Error('Invalid BnS template ID.');
  }

  static get templates () {
    return {
      filter_by_tag: CoolFilterByTag.metadata,
      tags_by_category: CoolTagsByCategory.metadata
    };
  }

  install () {
    if (!this._cool.isSourceAvailable()) return;
    if (this._cool.isInstalled()) this._cool.deleteTemplate();

    this._cool.copyTemplate();
    this._cool.makeConfig().make().flush();
  }
}
