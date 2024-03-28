import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
// import goodbye from 'graceful-goodbye'
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

import * as SDK from 'hyper-sdk'
import { RangeWatcher } from '@lejeunerenard/hyperbee-range-watcher-autobase'
import { BSON } from 'bson'
import { createMultiWriterDB } from './db.js'
import { setTodo, createTodo, configTodo } from './view.js';
const {WebSocket } = window

let resolveReady
const ready = new Promise(resolve => (resolveReady = resolve))
ready.then(_ => console.log('all set up'))

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))
const appName = 'todo';

const sdk = await SDK.create({
  storage: false,
  autoJoin: false,
  swarmOpts: {
    dht
  }
})

const db = await createMultiWriterDB(sdk)

const todoCollection = db.collection(appName)
// await todoCollection.createIndex(['text'])
// await todoCollection.createIndex(['done', 'text'])
resolveReady()

createWatcher()

export function addTodo (todo) {
  ready.then(() => todoCollection.insert(todo))
}
export function toggleTodo (_id) {
  return todoCollection.find({ _id }).then(([todo]) => {
    if (todo.done) return todoCollection.update({ _id }, { done: false })
    else return todoCollection.update({ _id }, { done: true })
  })
}
export function deleteTodo (_id) {
  return todoCollection.delete({ _id })
}

function createWatcher () {
  return new RangeWatcher(db.autobase.view, {}, null, updateStream)
}
async function updateStream (node) {
  const { key, value, type } = node
  if (b4a.includes(key, 'doc')) {
    const doc = BSON.deserialize(value)
    const todoElement = document.getElementById(doc._id.toString())
    if (type === 'put') {
      if (!todoElement) return setTodo(doc)
      const toReplaceWith = createTodo(doc)
      if (todoElement.innerHTML === toReplaceWith.innerHTML) return
      todoElement.replaceWith(toReplaceWith)
      configTodo(doc)
    }
    if (type === 'del') {
      todoElement.remove()
    }
  }
}
