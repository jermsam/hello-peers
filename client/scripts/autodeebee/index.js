import Hyperbee from 'hyperbee'
import b4a from 'b4a'
import { BSON } from 'bson'

export class Autodeebee {
  constructor (base, opts = {}) {
    this.autobase = base
    this.opts = opts
    if (!opts.sub) {
      this.autobase.start({
        unwrap: true,
        apply: applyAutobeeBatch,
        view: (core) =>
          new Hyperbee(core.unwrap(), {
            ...this.opts,
            extension: false
          })
      })
      this.bee = this.autobase.view
    }
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

  async put (key, value /*, opts = {} */) {
    const op = b4a.from(
      BSON.serialize({ type: 'put', key, value, prefix: this.bee.prefix })
    )

    return await this.autobase.append(op)
  }

  async del (key/*, opts = {} */) {
    const op = b4a.from(
      BSON.serialize({ type: 'del', key, prefix: this.bee.prefix })
    )
    return await this.autobase.append(op)
  }

  async get (key) {
    return await this.bee.get(key)
  }

  addInput (input) {
    this.autobase.addInput(input)
  }

  removeInput (input) {
    this.autobase.removeInput(input)
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
}

function getKeyBufferWithPrefix (key, prefix) {
  return prefix ? b4a.concat([b4a.from(prefix), b4a.from(key)]) : b4a.from(key)
}
// A real apply function would need to handle conflicts, beyond last-one-wins.
async function applyAutobeeBatch (bee, batch) {
  const b = bee.batch({ update: false })
  for (const node of batch) {
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
