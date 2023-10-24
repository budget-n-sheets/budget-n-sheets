/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Account {
  constructor (id) {
    this._id = id

    this._balance = 0
    this._color = 'whitesmoke'
    this._index = -1
    this._name = ''
    this._time_start = -1
  }

  static get fields () {
    return ['balance', 'color', 'name', 'time_start']
  }

  get data () {
    const o = {}
    Account.fields.forEach(k => o[k] = this[k])
    return o
  }

  set data (v) {
    for (const k of Account.fields) {
      if (v[k] == null) throw new Error('Missing value for field.')
      this[k] = v[k]
    }
  }

  get id () {
    return this._id
  }

  get balance () {
    return this._balance
  }

  get color () {
    return this._color
  }

  get index () {
    return this._index
  }

  get name () {
    return this._name
  }

  get time_start () {
    return this._time_start
  }

  set balance (v) {
    const t = +v
    if (isNaN(t)) throw new Error('Invalid account balance.')
    this._balance = t
  }

  set color (v) {
    this._color = !Consts.color_palette[v] ? 'whitesmoke' : v
  }

  set index (v) {
    if (!Number.isInteger(v)) throw new Error('Invalid account index.')
    this._index = v
  }

  set name (v) {
    const t = v.trim().replace(/\s+/g, ' ').slice(0, 64)
    if (t === '') throw new Error('Invalid account name.')
    this._name = t
  }

  set time_start (v) {
    if (!Number.isInteger(v)) throw new Error('Invalid account time start.')
    if (v < 0 || v > 11) throw new Error('Invalid account time start.')
    this._time_start = v
  }
}
