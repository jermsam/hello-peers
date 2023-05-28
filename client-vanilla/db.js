import { DB } from 'hyperdeebee'
// import Autobee from 'hyperdeebee/autodeebee'
// import Autobase from 'autobase'

// const defaultMultiWriterOpts = {
//  extPrefix: '',
//  name: 'db'
// }

/*
export async function createMultiWriterDB (sdk, discoveryCore, { extPrefix, name } = defaultMultiWriterOpts) {
  const localInput = await sdk.get(name + '-input')
  const localOutput = await sdk.get(name + '-output')
  const autobase = new Autobase({ localInput, inputs: [localInput], localOutput })
  const localBee = new Autobee(autobase)
  const db = createDB(localBee)

  const DBCores = new Set()
  DBCores.add(localInput.url)
  const newDBExt = discoveryCore.registerExtension(extPrefix + '-db-sync', {
    encoding: 'json',
    onmessage: async dbs => {
      let sawNew = false
      for (const db of dbs) {
        if (DBCores.has(db)) continue
        await handleNewDBURL(db)
        sawNew = true
      }
      if (sawNew) newDBExt.broadcast(Array.from(DBCores))
    }
  })
  newDBExt.broadcast(Array.from(DBCores))

  return db

  async function handleNewDBURL (dbUrl) {
    autobase.addInput(await sdk.get(dbUrl))
  }
}
*/

export function createDB (bee) {
  const db = new DB(bee)
  return db
}
