import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws';
// @ts-ignore
import Hyperswarm from 'hyperswarm';
// @ts-ignore
import goodbye from 'graceful-goodbye';
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))
console.log(dht);


const swarm = new Hyperswarm({dht});

const topicBuffer = b4a.from('say a good hello', 'hex')

swarm.join(topicBuffer)

goodbye(async () => {
  await swarm.leave(topicBuffer)
  await swarm.connections.forEach((conn) => conn.close())
  await swarm.destroy()
})


swarm.on('connection', (conn, peerInfo) => {
  console.log('new peer connected', peerInfo)
  conn.on('data', (dataUpdate) => {
    console.log('updated data: ', b4a.toString(dataUpdate));
    const jsonData = b4a.toString(dataUpdate);
    setTodo(JSON.parse(jsonData))
  })
});

const todoDialogOpenButton = document.getElementById('todo-dialog-open-button')
const todoDialogCloseButton = document.getElementById('todo-dialog-close-button')
const todoDialog = document.getElementById('todo-dialog')
const todoForm = document.getElementById('todo-form')
const todoList = document.getElementById('todo-list')
const todoText = document.getElementById("todo-text");
function setTodo(todo) {
  const li = document.createElement('li')
  console.log(todo);
  li.innerHTML = todo.text;
  todoList.appendChild(li)
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  if (todoText.value === "") {
    // throw error
    const err = 'please enter a todo text';
    console.error(err);
    document.getElementById("todo-error").innerHTML = err;
  } else {
    // perform operation with form input
    const todo = {
      text: todoText.value,
      done: false
    }
    swarm.connections.forEach((conn) =>  conn.write(JSON.stringify(todo)))
    setTodo(todo)
    todoText.value=''
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

