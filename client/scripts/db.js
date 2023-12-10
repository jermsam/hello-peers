import { DB } from 'hyperdeebee';
import Autobase from 'autobase';
import b4a from 'b4a';
// import { BSON } from 'bson';
import goodbye from 'graceful-goodbye';
import { Autodeebee } from './autodeebee/index.js';

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
      await autobase.addInput(await sdk.get(db));
    } catch (e) {
      console.error('error adding db:', e);
    }
    sawNew = true;
  }
  if (sawNew) {
    newDBExt.broadcast(Array.from(DBCores));
    console.log('got new dbs message, current inputs count:', DBCores.size);
    console.log('autobase inputs count:', autobase.inputs.filter((core) => core.readable).length);
    console.log('autobase status:', autobase.view.core.status);
  }
}

export async function getDb(sdk,  { autobase, extPrefix = '', options = { primaryKey: undefined } } = {}) {
  const name = options.topic || 'Hello Todos';
  const discovery = await initDiscovery(sdk, name);

  const localBee = new Autodeebee(autobase);
  await localBee.ready();
  const db = new DB(localBee);

  const DBCores = new Set();
  DBCores.add(autobase.localInput.id);

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
  const localInput = IOCore.get({ name: 'local-input' });
  const localOutput = IOCore.get({ name: 'local-output' });

  goodbye(async () => {
    await Promise.all([localInput.close(), localOutput.close()]);
  });

  await Promise.all([localInput.ready(), localOutput.ready()]);
  const autobase = new Autobase({ localInput, inputs: [localInput], localOutput });
  const db = await  getDb(sdk,  {autobase,});
  goodbye(async () => {
    await db.close()
    // await discovery.close()
    await sdk.close()
  })
  return db
}
