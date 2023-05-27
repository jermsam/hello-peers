import {useRef} from 'react';
import {XCircleIcon} from '@heroicons/react/20/solid';

// type TodoForm = {
//   text: string;
//   done?: boolean;
// }

import {z} from 'zod';
import { reset, SubmitHandler, useForm, zodForm} from '@modular-forms/react';
import { createSwarm } from './api/client.ts';
import { useEffect, useState } from 'react';

function useSwarm (topic: string) {
  const [swarm, setSwarm] = useState(null)
  useEffect(() => {
    const { swarm, deinit } = createSwarm(topic)
    setSwarm(swarm)
    return deinit
  }, [])
  return swarm
}

const specialSchema = z.object({
  text: z
    .string()
    .min(1, 'Please enter item text.'),
  // done: z.boolean(),
});

type TodoForm = z.infer<typeof specialSchema>;

const [todos, setTodo] = useState<TodoForm[]>([]);

function App() {
  const itemDialog = useRef<HTMLDialogElement>(null);
  const [todoForm, {Form, Field/*, FieldArray*/}] = useForm<TodoForm>({
    validate: zodForm(specialSchema),
  });
  const swarm = useSwarm('vue-rocks-todo') as any
  
  useEffect(() => {
    swarm.on('connection', (conn: any, peerInfo: any) => {
      console.log('new peer connected', peerInfo)
      conn.on('data', (dataUpdate: string) => {
        console.log('updated data: ', dataUpdate);
        setTodo(JSON.parse(dataUpdate))
      })
    });
    
    swarm.on('update', () => {
      console.log('peer updated...')
    })
  }, []);
  const handleSubmit: SubmitHandler<TodoForm> = (values: TodoForm /*event*/) => {
    swarm.connections.forEach((conn: any) => conn.send(JSON.stringify(values)))
    reset(todoForm);
    itemDialog.current?.close();
  };
  
  return (
    <section className="p-10">
      <button
        className="h-5 px-5 py-4  font-semibold rounded-md bg-black text-white flex items-center cursor-pointer shadow-2xl hover:shadow"
        onClick={() => itemDialog.current?.showModal()}
      >
        Add Item
      </button>
      <dialog ref={itemDialog} className="rounded-2xl backdrop:bg-gray-50 shadow-2xl">
        <div className="bg-white p-10 min-w-[300px] relative">
          <XCircleIcon className="h-6 w-6 absolute right-1 top-1 cursor-pointer"
                       onClick={() => itemDialog.current?.close()}/>
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl">Add Item</h3>
            
            <Form
              className="space-y-12 md:space-y-14 lg:space-y-16"
              onSubmit={handleSubmit}
            >
              
              <Field name="text" type="string">
                {(field, props) => (
                  <div>
                    <textarea
                      {...props}
                      value={field.value.value}
                      required
                      className="focus:ring-2 focus:ring-gray-950 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm"
                    />
                    {field.error && <div className="text-red-800">{field.error}</div>}</div>
                )}
              
              </Field>
              
              <div className="flex justify-end mt-5">
                <button type="submit"
                        className="h-5 px-5 py-4  font-semibold rounded-md bg-black text-white flex items-center cursor-pointer shadow-2xl hover:shadow">
                  Add
                </button>
              </div>
            </Form>
          </div>
        </div>
      </dialog>
      <div>
        {
          todos.map((item, index) => (
            <div key={index} className="w-96 bg-white shadow rounded">
              {item.text}
            </div>
          ))
        }
      </div>
    </section>
  );
}

export default App;
