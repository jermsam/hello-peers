import { addTodo, toggleTodo, deleteTodo } from './client.js'

const todoDialogOpenButton = document.getElementById('todo-dialog-open-button')
const todoDialogCloseButton = document.getElementById('todo-dialog-close-button')
const todoDialog = document.getElementById('todo-dialog')
const todoForm = document.getElementById('todo-form')
export const todoList = document.getElementById('todo-list')
const todoText = document.getElementById('todo-text')

export function deleteTask(todo){
  const deleteDialog = document.getElementById(`delete-${todo._id}-dialog`)
  
  deleteDialog.showModal()
  document.getElementById(`delete-${todo._id}-confirm`).onclick = () => {
    
    deleteTodo(todo._id)
    deleteDialog.close()
  }
  document.getElementById(`${todo._id}-dialog-close-button`).onclick = () => {
    deleteDialog.close()
  }
}

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
  document.getElementById(`checkbox-${todo._id}`).onclick = () => toggleTodo(todo._id)
  document.getElementById(`delete-${todo._id}`).onclick = () => deleteTask(todo)
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
                    <dialog id="delete-${todo._id}-dialog" class="rounded-2xl backdrop:bg-gray-50 shadow-2xl">
                      <div class="bg-white p-10 min-w-[300px] relative">
                        <svg id="${todo._id}-dialog-close-button"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                             class="h-6 w-6 absolute right-1 top-1 cursor-pointer">
                          <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    
                        <div class="flex flex-col gap-2">
                          <h3 class="text-2xl">Are you sure about deleting this task ?</h3>
                        </div>
                        <div class="flex justify-end mt-5">
                          <button
                            id="delete-${todo._id}-confirm"
                            type="button"
                            class="h-5 px-5 py-4  font-semibold rounded-md bg-black text-white flex items-center cursor-pointer shadow-2xl hover:shadow">
                            Sure Delete
                          </button>
                        </div>
                      </div>
                    </dialog>
`

  return section
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault()

  if(/\w/.test(todoText.value.trim())) {
    const todo = {
      text: todoText.value,
      done: false
    }
    addTodo(todo)

    todoText.value = ''
    todoDialog.close()
  } else {
    document.getElementById('todo-error').innerHTML = 'please enter a todo text'
  }

  // handle submit
})

todoDialogOpenButton.addEventListener('click', function openDialog () {
  todoDialog.showModal()
})

todoDialogCloseButton.addEventListener('click', function closeDialog () {
  todoDialog.close()
})
