/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function tagsService (job, payload) {
  switch (job) {
    case 'get':
      return TagsService.getCategories()
    case 'save':
      TagsService.setCategories(payload)
      break

    default:
      throw new Error('tagsService(): Switch case is default.')
  }
}
