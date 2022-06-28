class MakeSheet extends MirrorSheet {
  constructor (metadata) {
    super(metadata);
  }

  install () {
    this.makeConfig().make();
  }

  reinstall () {
    this.deleteTemplate().copyTemplate();
    this.makeConfig().make();
  }
}
