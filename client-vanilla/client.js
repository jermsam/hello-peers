import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws';
// @ts-ignore
import Hyperswarm from 'hyperswarm';
// @ts-ignore
import goodbye from 'graceful-goodbye';
import * as BufferSource from 'buffer/'

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))
console.log(dht);


const swarm = new Hyperswarm({dht});

const topicBuffer = BufferSource.Buffer.from('say a good hello', 'hex')

swarm.join(topicBuffer)

goodbye(async () => {
  await swarm.leave(topicBuffer)
  await swarm.connections.forEach((conn) => conn.close())
  await swarm.destroy()
})


swarm.on('connection', (conn, peerInfo) => {
  console.log('new peer connected', peerInfo)
  conn.on('data', (dataUpdate) => {
    console.log('updated data: ', dataUpdate);
    setTodo(JSON.parse(dataUpdate))
  })
});

const todoDialogOpenButton = document.getElementById('todo-dialog-open-button')
const todoDialogCloseButton = document.getElementById('todo-dialog-close-button')
const todoDialog = document.getElementById('todo-dialog')
const todoForm = document.getElementById('todo-form')
const todoList = document.getElementById('todo-list')
function setTodo(todo) {
  const li = document.createElement('li')
  console.log(todo);
  li.innerHTML = todo.text;
  todoList.appendChild(li)
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("todo-text");
  if (text.value === "") {
    // throw error
    const err = 'please enter a todo text';
    console.error(err);
    document.getElementById("error").innerHTML = err;
  } else {
    // perform operation with form input
    const todo = {
      text: text.value,
      done: false
    }
    console.log(swarm.connections);
    swarm.connections.forEach((conn) => {
      console.log(conn);
      // conn.send(JSON.stringify(todo));
      conn.write(BufferSource.Buffer.from(JSON.stringify(todo)))
    })
    
    todoDialog.close()
  }
  // handle submit
});

todoDialogOpenButton.addEventListener('click', function openDialog() {
  todoDialog.showModal()
})

todoDialogCloseButton.addEventListener('click', function closeDialog() {
  todoDialog.close()
})

