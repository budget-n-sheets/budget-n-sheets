/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function coolGalleryService (job, id) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (job) {
    case 'get':
      new CoolGalleryService(id).install();
      break;
    case 'list':
      return CoolGalleryService.templates;

    default:
      console.error('coolGalleryService(): Switch case is default.');
      break;
  }
}
