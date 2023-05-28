import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
import goodbye from 'graceful-goodbye'
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

import * as SDK from 'hyper-sdk'
import { createDB } from './db'
import { setTodo, getTodoList } from './view'
const { crypto, WebSocket } = window

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))

const sdk = await SDK.create({
  storage: false,
  swarmOpts: {
    dht
  }
})

const topicBuffer = await crypto.subtle.digest('SHA-256', b4a.from('say a good hello', 'hex')).then(b4a.from)

const discovery = await sdk.get(topicBuffer)

discovery.on('new-peer', peerInfo => {
  console.log('new peer:', peerInfo.publicKey.toString('hex'))
})

const db = createDB(await sdk.getBee('todo-app'))
goodbye(async () => {
  await db.close()
  await discovery.close()
  await sdk.close()
})
const todoCollection = db.collection('todo')
todoCollection.createIndex(['text'])
todoCollection.createIndex(['done', 'text'])

db.bee.core.on('append', async () => {
  const setTodos = getTodoList().map(todo => todo.key)
  for await (const todo of todoCollection.find()) {
    if (todo._id in setTodos) continue
    setTodo(todo)
  }
})

export function addTodo (todo) {
  todoCollection.insert(todo)
}
