/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class AccountsDb extends TablesDb {
  constructor () {
    const key = 'db_accounts'
    super(key)
  }

  create (data) {
    const id = this.getUuid_()
    const acc = new Account(id)

    data.index = -1
    acc.data = data

    for (const id of this._ids) {
      if (this._db[id].name === acc.name) throw new Error('Duplicate account name.')
    }

    this._db[id] = acc.data
    this.commit()
    acc.index = this.indexOf_(id)

    return acc
  }

  delete (id) {
    if (this._db[id]) this.delete_(id)
    else console.error('Account not found.')
  }

  get (id) {
    if (!this._db[id]) throw new Error('Account not found.')

    const acc = new Account(id)
    acc.data = this._db[id]

    return acc
  }

  update (acc) {
    if (!acc instanceof Account) throw new Error('Invalid item.')

    const id = acc.id
    if (!this._db[id]) throw new Error('Account not found.')

    acc.index = -1
    this._db[id] = acc.data
    this.commit()
    acc.index = this.indexOf_(id)

    return acc
  }
}
