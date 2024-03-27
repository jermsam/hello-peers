import b4a from 'b4a'
import { BSON } from 'bson'

export class Autodeebee {
  constructor (base, sdk, opts = {}) {
    this.autobase = base
    this.opts = opts
    // the open() handler should create the hyperbee for you. This will mean that autobase.view is a hyperbee then and you wont need to create a hyperbee in Autodeebee.
    this.bee = this.autobase.view
  }

  static async apply (batch, view) {
    const b = view.batch({ update: false })
    for (const node of batch) {
      if('id' in node.value) continue;
      const op = BSON.deserialize(node.value)
      const bufKey = getKeyBufferWithPrefix(op.key.buffer || op.key, op.prefix.buffer || op.prefix)
      if (op.type === 'put') {
        await b.put(bufKey, op.value.buffer)
      }
      if (op.type === 'del') {
        await b.del(bufKey)
      }
    }
    await b.flush()
  }

  ready () {
    return this.autobase.ready()
  }

  feed () {
    return this.bee.feed
  }

  async close () {
    await this.autobase.close()
    this.autobase = null
  }

   sub (name) {
    const opts = this.opts
    opts.sub = true
    const auto = new Autodeebee(this.autobase, opts)

   auto.bee = this.bee.sub(name)
    return auto
  }

  batch () {
    return this
  }

  flush () { }

  put (key, value, /*opts={}*/) {
    const op = b4a.from(
      BSON.serialize({ type: 'put', key, value, prefix: this.bee.prefix })
    )

    return  this.autobase.append(op)
  }

  del (key, /*opts = {}*/ ) {
    const op = b4a.from(
      BSON.serialize({ type: 'del', key, prefix: this.bee.prefix })
    )
    return this.autobase.append(op)
  }

  get (key, opts={}) {
    return this.bee.get(key,opts)
  }

  // addInput & removeInput will need to be refactored for the new way of managing writers. You add a writer via base.addWriter(key, { indexer = true })
  addInput (input, opts={indexer: true}) {
    const key = input.key;
    return this.autobase.addWriter(key, opts)
  }

  removeInput (key) {
    return this.autobase.removeWriter(key)
  }

  createReadStream (opts) {
    return this.bee.createReadStream(opts)
  }

  createHistoryStream (opts) {
    return this.bee.createHistoryStream(opts)
  }

  createDiffStream (opts) {
    return this.bee.createDiffStream(opts)
  }

  version () {
    return this.bee.version
  }

  peek (opts) {
    return this.bee.peek(opts)
  }
}

export function getKeyBufferWithPrefix (key, prefix) {
  return prefix ? b4a.concat([b4a.from(prefix), b4a.from(key)]) : b4a.from(key)
}

