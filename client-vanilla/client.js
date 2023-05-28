import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
import goodbye from 'graceful-goodbye'
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

import * as SDK from 'hyper-sdk'
import { createMultiWriterDB, createDB } from './db'
import { setTodo, createTodo, configTodo, todoList } from './view'
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
  console.log('new peer, peer:', peerInfo, 'peer count:', discovery.peers.length)
})

const db = await createMultiWriterDB(sdk, discovery)
// const db = createDB(await sdk.getBee('todo-app'))
goodbye(async () => {
  await db.close()
  await discovery.close()
  await sdk.close()
})
const todoCollection = db.collection('todo')
await todoCollection.createIndex(['text'])
await todoCollection.createIndex(['done', 'text'])
// db.bee.core.on('append', async () => {
console.log(db.autobase)
db.autobase.on('append', async () => {
  console.log(db.autobase)
  for await (const todo of todoCollection.find()) {
    console.log('a doc')
    const todoElement = document.getElementById(todo._id.toString())
    if (!todoElement) {
      setTodo(todo)
    } else {
      const toReplaceWith = createTodo(todo)
      if (todoElement.innerHTML === toReplaceWith.innerHTML) continue
      console.log('different todo detected')
      todoElement.replaceWith(toReplaceWith)
      configTodo(todo)
    }
  }
  todoList.querySelectorAll('section').forEach(async section => {
    if ((await todoCollection.find({ _id: section.id })).length === 0) section.remove()
  })
})

resolveReady()

sdk.joinCore(discovery).then(() => console.log('discovering'))

export function addTodo (todo) {
  ready.then(() => todoCollection.insert(todo))
}
export function toggleTodo (_id) {
  return todoCollection.find({ _id }).then(([todo]) => {
    if (todo.done) todoCollection.update({ _id }, { done: false })
    else todoCollection.update({ _id }, { done: true })
  })
}
export function deleteTodo (_id) {
  return todoCollection.delete({ _id })
}
