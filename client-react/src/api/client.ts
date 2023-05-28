
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

export function createSwarm (topic: string, port = 3400) {
  const socket = new WebSocket(`ws://localhost:${port}`);
  console.log(socket);
  const dht = new DHT(new Stream(true, socket))
  
  const swarm = new Hyperswarm({dht});
  
  const topicBuffer = BufferSource.Buffer.from(topic, 'hex')

  swarm.join(topicBuffer)
  
  return { swarm, deinit:  goodbye(async () => {
      await swarm.leave(topicBuffer)
      await swarm.connections.forEach((conn: any) => conn.close())
      await swarm.destroy()
    })}
}

