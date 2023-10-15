/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class UpdateScript extends Update {
  constructor () {
    const v0 = ClassVersion.get('script');
    const vA = Info.apps_script.version;
    const list = [
      [
        null, [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [],
        ['', '', '', '', '', '', 'v0m49p6_', '', ''],
        ['', '', '', '', ''],
        ['', '']
      ]
    ];

    super(v0, vA, list);
    this._key = 'script';
  }

  /**
   * Stamp.
   *
   * 0.49.6
   */
  v0m49p6_ () {
    Stamp.seal()
    return 0;
  }
}
