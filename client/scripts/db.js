import { DB } from 'hyperdeebee';
import Autobase from 'autobase';
import b4a from 'b4a';
import goodbye from 'graceful-goodbye';
import { Autodeebee} from './autodeebee/index.js';
import Hyperbee from 'hyperbee';

const defaultMultiWriterOpts = {
  extPrefix: '',
  name: 'db'
};

async function initDiscovery(sdk, name) {
  const topic = await crypto.subtle.digest('SHA-256', b4a.from(name, 'hex')).then(b4a.from);
  const discovery = await sdk.get(topic);
  sdk.joinCore(discovery).then(() => console.log('discovering'));
  discovery.on('peer-add', (peerInfo) => {
    console.log('new peer, peer:', peerInfo, 'peer count:', discovery.peers.length);
  });
  return discovery;
}

async function handleNewDbs(sdk, {dbs, DBCores, autobase, newDBExt} = {}) {
  let sawNew = false;
  for (const db of dbs) {
    if (typeof db !== 'string' || DBCores.has(db)) continue;
    DBCores.add(db);
    try {
      const core = await sdk.get(db);
      await autobase.append(core);
    } catch (e) {
      console.error('error adding db:', e);
    }
    sawNew = true;
  }
  if (sawNew) {
    newDBExt.broadcast(Array.from(DBCores));
    console.log('got new dbs message, current inputs count:', DBCores.size);
    console.log('autobase inputs count:', autobase.activeWriters);
    console.log('autobase status:', autobase.view.core);
  }
}

export async function getDb(sdk,  { autobase, extPrefix = '', options = { primaryKey: undefined } } = {}) {
  const name = options.topic || 'Hello Todos';
  const discovery = await initDiscovery(sdk, name);

  const localBee = new Autodeebee(autobase);
  await localBee.ready();
  const db = new DB(localBee);

  const DBCores = new Set();
  DBCores.add(autobase.localWriter.core.id);

  const newDBExt = discovery.registerExtension(extPrefix + '-db-sync', {
    encoding: 'json',
    onmessage: async (dbs) => {
      await handleNewDbs(sdk, {
        dbs,
        DBCores,
        autobase,
        newDBExt
      });
    },
  });

  discovery.on('peer-add', () => {
    newDBExt.broadcast(Array.from(DBCores));
  });

  newDBExt.broadcast(Array.from(DBCores));
  db.autobase = autobase;

  return db;
}



export async function createMultiWriterDB(sdk, { extPrefix, name } = defaultMultiWriterOpts) {
  const IOCore = await sdk.namespace(name);
  // there is no need to get the input and output cores as autobase does that for you now.

  const autobase = new Autobase(IOCore,null,{
    apply: async (batch, view, base) => {
      // Add .addWriter functionality
      for (const node of batch) {
        const op = node.value
        if ('id' in op) {
          console.log('\rAdding writer', op.key)
          await base.addWriter(b4a.from(op.key, 'hex'))
        }
      }

      // Pass through to Autobee's apply
      await Autodeebee.apply(batch, view, base)
    },
    open: (store)=> {
     const core = store.get(name)
      return  new Hyperbee(core, {
        extension: false,
      })
     }
  });
  await autobase.ready();
  const db = await  getDb(sdk,  {autobase,extPrefix});
  goodbye(async () => {
    await db.close()
    // await discovery.close()
    await sdk.close()
  })
  return db
}
