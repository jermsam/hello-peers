import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
import goodbye from 'graceful-goodbye'
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

import * as SDK from 'hyper-sdk'
import { createMultiWriterDB } from './db'
import { setTodo, todoList } from './view'
const { crypto, WebSocket } = window

let resolveReady
const ready = new Promise(resolve => (resolveReady = resolve))
ready.then(_ => console.log('all set up'))

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))

const sdk = await SDK.create({
  storage: false,
  autoJoin: false,
  swarmOpts: {
    dht
  }
})

const topicBuffer = await crypto.subtle.digest('SHA-256', b4a.from('say a good hello', 'hex')).then(b4a.from)

const discovery = await sdk.get(topicBuffer)

discovery.on('peer-add', peerInfo => {
  console.log('new peer:', peerInfo)
})

const db = await createMultiWriterDB(sdk, discovery)
goodbye(async () => {
  await db.close()
  await discovery.close()
  await sdk.close()
})
const todoCollection = db.collection('todo')
await todoCollection.createIndex(['text'])
await todoCollection.createIndex(['done', 'text'])

resolveReady()

sdk.joinCore(discovery).then(() => console.log('discovering'))

export function addTodo (todo) {
  ready.then(() => todoCollection.insert(todo)).then(setTodo)
}
