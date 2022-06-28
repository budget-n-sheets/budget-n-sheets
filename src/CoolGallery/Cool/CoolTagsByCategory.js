class CoolTagsByCategory extends CoolGallery {
  constructor () {
    super(CoolTagsByCategory.metadata);
  }

  static get metadata () {
    return {
      template_id: '',
      version_name: 'v0.1.2',
      name: 'Tags by Category',
      description: 'Group tags by category.',
      sheets: ['Tags by Category'],
      requires: ['Tags']
    };
  }

  make () {
    this._sheet.setTabColor('#e69138');
    return this;
  }

  makeConfig () {
    this._sheet = this._spreadsheet.getSheetByName('Tags by Category');
    return this;
  }
}
