/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Card {
  constructor (id) {
    this._id = id

    this._aliases = []
    this._code = ''
    this._color = 'whitesmoke'
    this._index = -1
    this._limit = -1
    this._name = ''
  }

  static get fields () {
    return ['code', 'aliases', 'color', 'limit', 'name']
  }

  get data () {
    const o = {}
    Card.fields.forEach(k => o[k] = this[k])
    return o
  }

  set data (v) {
    for (const k of Card.fields) {
      if (v[k] == null) throw new Error('Missing value for field.')
      this[k] = v[k]
    }
  }

  get id () {
    return this._id
  }

  get aliases () {
    return this._aliases
  }

  get code () {
    return this._code
  }

  get color () {
    return this._color
  }

  get index () {
    return this._index
  }

  get limit () {
    return this._limit
  }

  get name () {
    return this._name
  }

  set aliases (v) {
    const c = this.code
    let t = v
    if (!Array.isArray(v)) {
      if (typeof v !== 'string') throw new Error('Invalid card aliases.')
      t = v.trim()
        .replace(/\s/g, '')
        .split(',')
    }
    this._aliases = t.filter(a => /^\w{1,16}$/.test(a))
      .filter(a => a !== c)
      .slice(0, 16)
  }

  set code (v) {
    const t = v.trim().replace(/\s+/g, '').slice(0, 16)
    if (t === '') throw new Error('Invalid card code.')
    this._code = t
  }

  set color (v) {
    this._color = !Consts.color_palette[v] ? 'whitesmoke' : v
  }

  set index (v) {
    if (!Number.isInteger(v)) throw new Error('Invalid card index.')
    this._index = v
  }

  set limit (v) {
    const t = +v
    if (isNaN(t)) throw new Error('Invalid card limit.')
    this._limit = t
  }

  set name (v) {
    const t = v.trim().replace(/\s+/g, ' ').slice(0, 64)
    if (t === '') throw new Error('Invalid card name.')
    this._name = t
  }
}
