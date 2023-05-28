import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

import * as SDK from 'hyper-sdk'
import { createMultiWriterDB } from './db'
import { setTodo, createTodo, configTodo } from './view'
const { crypto } = window

export async function createDB (topic, socket, todoList) {
  let resolveReady
  const ready = new Promise(resolve => (resolveReady = resolve))
  ready.then(_ => console.log('all set up'))

  const dht = new DHT(new Stream(true, socket))

  const sdk = await SDK.create({
    storage: false,
    autoJoin: false,
    swarmOpts: {
      dht
    }
  })

  const topicBuffer = await crypto.subtle.digest('SHA-256', b4a.from(topic, 'hex')).then(b4a.from)

  const discovery = await sdk.get(topicBuffer)

  discovery.on('peer-add', peerInfo => {
    console.log('new peer, peer:', peerInfo, 'peer count:', discovery.peers.length)
  })

  const { db, deinit } = await createMultiWriterDB(sdk, discovery)

  const todoCollection = db.collection('todo')
  await todoCollection.createIndex(['text'])
  await todoCollection.createIndex(['done', 'text'])
  db.autobase.on('append', async () => {
    for await (const todo of todoCollection.find()) {
      const todoElement = document.getElementById(todo._id.toString())
      if (!todoElement) {
        setTodo(todo)
      } else {
        const toReplaceWith = createTodo(todo)
        if (todoElement.innerHTML === toReplaceWith.innerHTML) continue
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

  return {
    addTodo,
    toggleTodo,
    deleteTodo,
    queryTodos (query) {
      return todoCollection.find(query)
    },
    async deinit () {
      await deinit()
      await db.close()
      await discovery.close()
      await sdk.close()
      socket.close()
    }
  }
  function addTodo (todo) {
    console.log('adding todo', todo.text)
    ready.then(() => todoCollection.insert(todo))
      .then(doc => console.log('added', doc.text, 'as', doc._id.toString()))
  }
  function toggleTodo (_id) {
    console.log('toggling', _id)
    return todoCollection.find({ _id }).then(([todo]) => {
      if (todo.done) return todoCollection.update({ _id }, { done: false })
      else return todoCollection.update({ _id }, { done: true })
    })
      .then(_ => console.log('toggled', _id.toString()))
  }
  function deleteTodo (_id) {
    console.log('deleting', _id)
    return todoCollection.delete({ _id })
      .then(_ => console.log('deleted', _id.toString()))
  }
}
