import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
// @ts-ignore
import goodbye from 'graceful-goodbye'
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'
import * as SDK from 'hyper-sdk'
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

goodbye(async () => {
  await discovery.close()
  await sdk.close()
})

discovery.on('new-peer', peerInfo => {
  console.log('new peer:', peerInfo.publicKey.toString('hex'))
})
const newDataExt = discovery.registerExtension(topicBuffer + 'new-data', {
  encoding: 'json',
  onmessage: setTodo
})

const todoDialogOpenButton = document.getElementById('todo-dialog-open-button')
const todoDialogCloseButton = document.getElementById('todo-dialog-close-button')
const todoDialog = document.getElementById('todo-dialog')
const todoForm = document.getElementById('todo-form')
const todoList = document.getElementById('todo-list')
const todoText = document.getElementById('todo-text')
function setTodo (todo) {
  const li = document.createElement('li')
  console.log(todo)
  li.innerHTML = todo.text
  todoList.appendChild(li)
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault()

  if (todoText.value === '') {
    // throw error
    const err = 'please enter a todo text'
    console.error(err)
    document.getElementById('todo-error').innerHTML = err
  } else {
    // perform operation with form input
    const todo = {
      text: todoText.value,
      done: false
    }
    newDataExt.broadcast(todo)
    setTodo(todo)
    todoText.value = ''
    todoDialog.close()
  }
  // handle submit
})

todoDialogOpenButton.addEventListener('click', function openDialog () {
  todoDialog.showModal()
})

todoDialogCloseButton.addEventListener('click', function closeDialog () {
  todoDialog.close()
})
