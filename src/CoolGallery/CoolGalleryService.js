class CoolGalleryService {
  constructor (id = '') {
    this._cool = CoolGallery.getById(id);
    if (!this._cool) throw new Error('Invalid BnS template ID.');
  }

  static getAvailableTemplates () {
    const templates = {};
    const list = ['filter_by_tag'/*, stats_for_tags*/];
    for (const id of list) {
      const cool = CoolGallery.getById(id);
      if (cool.isAvailable()) templates[id] = cool._metadata;
    }
    return templates;
  }

  install () {
    if (!this._cool.isAvailable()) return;
    if (this._cool.isInstalled()) this._cool.deleteTemplate();

    this._cool.copyTemplate();
    this._cool.makeConfig().make().flush();
  }
}
