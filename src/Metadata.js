class Metadata {
  constructor (spreadsheet) {
    this.spreadsheet = spreadsheet || SpreadsheetApp2.getActive();

    this.keys = [];
    this.metadata = {};

    this.refresh_();
  }

  add_ (key, value) {
    this.spreadsheet.addDeveloperMetadata(
      key, JSON.stringify(value),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);

    this.refresh_();
  }

  set_ (key, value) {
    for (const id in this.metadata) {
      if (this.metadata[id].key === key) {
        this.metadata[id].value = value;
        this.metadata[id].item.setValue(JSON.stringify(value));
        break;
      }
    }
  }

  refresh_ () {
    this.keys = [];
    this.metadata = {};

    this.spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(item => {
        const key = item.getKey();

        this.keys.push(key);
        this.metadata[item.getId()] = {
          item: item,
          key: key,
          value: JSON.parse(item.getValue())
        };
      });
  }

  getValueOf (key) {
    if (!this.hasKey(key)) return null;

    for (const id in this.metadata) {
      if (this.metadata[id].key === key) return this.metadata[id].value;
    }

    return null;
  }

  hasKey (key) {
    return this.keys.indexOf(key) !== -1;
  }

  update (key, value) {
    if (this.hasKey(key)) this.set_(key, value);
    else this.add_(key, value);

    return this;
  }
}
