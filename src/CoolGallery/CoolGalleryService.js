/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CoolGalleryService {
  constructor (id = '') {
    this._cool = CoolGallery.getById(id);
    if (!this._cool) throw new Error('Invalid BnS template ID.');
  }

  static get templates () {
    return {
      filter_by_tag: CoolFilterByTag.metadata,
      stats_for_tags: CoolStatsForTags.metadata,
      tags_by_category: CoolTagsByCategory.metadata
    };
  }

  install () {
    if (!this._cool.isSourceAvailable()) return;
    if (!this._cool.checkDependencies()) this._cool.meetRequirements();
    if (this._cool.isInstalled()) this._cool.deleteTemplate();

    this._cool.copyTemplate();
    this._cool.makeConfig().make().flush();
  }
}
