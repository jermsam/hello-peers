import goodbye from 'graceful-goodbye'
import { createDB } from './client'
const { WebSocket } = window
let db
const socketUrl = 'ws://localhost:3400/'

goodbye(_ => db.deinit())

const todoDialogOpenButton = document.getElementById('todo-dialog-open-button')
const todoDialogCloseButton = document.getElementById('todo-dialog-close-button')
const todoDialog = document.getElementById('todo-dialog')
const todoForm = document.getElementById('todo-form')
const todoText = document.getElementById('todo-text')
const todoList = document.getElementById('todo-list')

setDB('say a good hello', socketUrl, todoList)

export function setTodo (todo) {
  todoList.appendChild(createTodo(todo))
  configTodo(todo)
}
export function configTodo (todo) {
  document.getElementById(`checkbox-${todo._id}`).innerHTML = todo.done
    ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">\n' +
    '  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />\n' +
    '</svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">\n' +
    '  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />\n' +
    '</svg>'
  document.getElementById(`checkbox-${todo._id}`).onclick = () => db.toggleTodo(todo._id)
  document.getElementById(`delete-${todo._id}`).onclick = () => db.deleteTodo(todo._id)
  const textLine = document.getElementById(`text-${todo._id}`)
  todo.done ? textLine.classList.add('line-through') : textLine.classList.remove('line-through')
}
export function createTodo (todo) {
  const section = document.createElement('section')
  section.id = todo._id.toString()
  section.innerHTML = `
<div class="flex items-center justify-between max-w-2xl px-8 py-4 mx-auto border cursor-pointer rounded-xl dark:border-gray-700 m-10">
                        <div class="flex items-center">
                            <div id="checkbox-${todo._id}">
                           
                            </div>

                            <div class="flex flex-col items-center mx-5 space-y-1">
                                <h2 id="text-${todo._id}" class="text-lg font-medium text-gray-700 sm:text-2xl dark:text-gray-950"> ${todo.text}</h2>
                            </div>
                        </div>
                         <svg id="delete-${todo._id}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 cursor-pointer">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                    </div>
`

  return section
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
    db.addTodo(todo)
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

async function setDB (topic, socketUrl, todoList) {
  if (db) await db.deinit()
  todoList.innerHTML = ''
  db = await createDB(topic, new WebSocket(socketUrl), todoList)
}
