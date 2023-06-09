
import { DB } from 'hyperdeebee'
import Autobase from 'autobase'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'
import { BSON } from 'bson'
import goodbye from 'graceful-goodbye'

const defaultMultiWriterOpts = {
  extPrefix: '',
  name: 'db'
}

export async function createMultiWriterDB (sdk, discoveryCore, { extPrefix, name } = defaultMultiWriterOpts) {
  const IOCore = await sdk.namespace(name)
  const localInput = IOCore.get({ name: 'local-input' })
  const localOutput = IOCore.get({ name: 'local-output' })
  goodbye(async () => {
    await Promise.all([localInput.close(), localOutput.close()])
  })
  await Promise.all([localInput.ready(), localOutput.ready()])
  const autobase = new Autobase({ localInput, inputs: [localInput], localOutput })
  const localBee = new Autobee(autobase)
  await localBee.ready()
  const db = createDB(localBee)

  const DBCores = new Set()
  DBCores.add(localInput.id)
  console.log(localInput.id)
  const newDBExt = discoveryCore.registerExtension(extPrefix + '-db-sync', {
    encoding: 'json',
    onmessage: async dbs => {
      let sawNew = false
      for (const db of dbs) {
        if (typeof db !== 'string' || DBCores.has(db)) continue
        await handleNewDBURL(db)
        sawNew = true
      }
      if (sawNew) {
        newDBExt.broadcast(Array.from(DBCores))
        console.log('got new dbs message, current inputs count:', DBCores.size)
        console.log('autobase inputs count:', autobase.inputs.filter(core => core.readable).length)
        console.log('autobase status:', autobase.view.core.status)
      }
    }
  })
  discoveryCore.on('peer-add', () => {
    newDBExt.broadcast(Array.from(DBCores))
  })
  newDBExt.broadcast(Array.from(DBCores))

  db.autobase = autobase
  return db

  async function handleNewDBURL (dbUrl) {
    DBCores.add(dbUrl)
    try {
      await autobase.addInput(await sdk.get(dbUrl))
    } catch (e) {
      console.error('error adding db:', e)
    }
  }
}

export function createDB (bee) {
  return new DB(bee)
}

class Autobee {
  constructor (autobase, opts = {}) {
    this.autobase = autobase
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
    const auto = new Autobee(this.autobase, opts)
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
