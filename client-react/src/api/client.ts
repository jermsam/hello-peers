// @ts-ignore
import DHT from '@hyperswarm/dht-relay'
// @ts-ignore
import Stream from '@hyperswarm/dht-relay/ws';
// @ts-ignore
import Hyperswarm from 'hyperswarm';
// @ts-ignore
import goodbye from 'graceful-goodbye';
// import * as BufferSource from 'buffer/'
import b4a from 'b4a'

const socket = new WebSocket('ws://localhost:3400')
const dht = new DHT(new Stream(true, socket))


const swarm = new Hyperswarm({dht});

const topicBuffer = b4a.from('say a good hello', 'hex')

swarm.join(topicBuffer)

goodbye(async () => {
  await swarm.leave(topicBuffer)
  await swarm.connections.forEach((conn: any) => conn.close())
  await swarm.destroy()
})


export default swarm

