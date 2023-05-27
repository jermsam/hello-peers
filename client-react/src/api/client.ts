
// import socketIO from "socket.io-client";
// import WebSocket from 'ws';
// @ts-ignore
import DHT from '@hyperswarm/dht-relay';
// @ts-ignore
import Stream from '@hyperswarm/dht-relay/ws';
// @ts-ignore
import Hyperswarm from 'hyperswarm';
// @ts-ignore
import goodbye from 'graceful-goodbye';
import * as BufferSource from 'buffer/'
// async function createTopic (topic) {
//   const prefix = 'some-app-prefix-'
//   const encoder = new TextEncoder();
//   const data = encoder.encode(prefix + topic);
//
//   return await crypto.subtle.digest("SHA-256", data)
//   // return crypto.randomBytes(32)
// }
const port = 3400;
// export const socket = socketIO.connect("ws://localhost:3000");
export const socket = new WebSocket(`ws://localhost:${port}`);

// socket.on('open', () => {
//   socket.send('Hi this is client A')
// })

const dht = new DHT(new Stream(true, socket))

export const swarm = new Hyperswarm({dht});



const topicBuffer = BufferSource.Buffer.from('vue-rocks-todo', 'hex')

swarm.join(topicBuffer)


goodbye(async () => {
  
  await swarm.leave(topicBuffer)
  await swarm.destroy()
  
})

