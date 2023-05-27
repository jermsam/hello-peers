<script setup lang="ts">
  import { XCircleIcon } from "@heroicons/vue/20/solid"
  import {onMounted, ref} from 'vue';
  import {swarm} from './api/client.ts';
  type TodoForm = {
    text: string;
    done?: boolean;
  }
  const itemDialog = ref<HTMLDialogElement>();
  const connections = ref(new Map());
  const todoForm = ref({
    text:'',
    done: false
  });
  const todos = ref([])

  onMounted(async () => {
    await swarm.flush() // Waits for the swarm to connect to pending peers.


    swarm.on('connection', (conn: any, peerInfo: any) => {
      conn.write('this is a server connection')
      const key = peerInfo.publicKey
      console.log('peers connected', peerInfo)
      connections.value.set(key, conn)
      conn.on('data', (dataUpdate: TodoForm[]) => {
        console.log('updated data: ', dataUpdate);
        todos.value = dataUpdate
      })
      conn.on('close', () => connections.value.delete(key))
      conn.on('error', () => connections.value.delete(key))
    });

    swarm.on('update', () => {
      // store.connections?.forEach(conn => {
      //   conn.on('data', (dataUpdate: TodoForm[]) => {
      //     console.log('updated data: ', dataUpdate);
      //     todos.value = dataUpdate
      //   })
      // })
      console.log('peer updated...')
    })
  })

  const handleSubmit = () => {
    connections.value?.forEach(conn => conn.send(JSON.stringify(todoForm)))
    todoForm.value.text = '';
    itemDialog.value?.close();
  };

</script>

<template>
  <section>
    <button
        class="h-5 px-5 py-4  font-semibold rounded-md bg-black text-white flex items-center cursor-pointer shadow-2xl hover:shadow"
        @click="() => itemDialog?.showModal()"
    >
    Add Item
    </button>
    <dialog ref="itemDialog" class="rounded-2xl backdrop:bg-gray-50 shadow-2xl">
    <div class="bg-white p-10 min-w-[300px] relative">
      <x-circle-icon class="h-6 w-6 absolute right-1 top-1 cursor-pointer" @click="() => itemDialog?.close()"/>
   <div class="flex flex-col gap-2">
    <h3 class="text-2xl">Add Item</h3>
<form @submit="handleSubmit">
  <div>
                  <textarea
                    v-model="todoForm.text"
                      class="focus:ring-2 focus:ring-gray-950 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm"
                  />
<!--    {field.error && <div class={'text-red-800'}>{field.error}</div>}-->
  </div>
  <div class="flex justify-end mt-5">
  <button type="submit"
          class="h-5 px-5 py-4  font-semibold rounded-md bg-black text-white flex items-center cursor-pointer shadow-2xl hover:shadow">
    Add
  </button>
   </div>
</form>
    </div>
    </div>
    </dialog>
    <div class="">
      <div v-for="(item, index) in todos" :key="index" class="w-96 bg-white shadow rounded">
        {{ item.text }}
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
