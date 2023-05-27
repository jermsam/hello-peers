import  {WebSocketServer} from 'ws';
import express from 'express';
import http from 'http';

// @ts-ignore
import DHT from 'hyperdht'
// @ts-ignore
import { relay } from '@hyperswarm/dht-relay'
// @ts-ignore
import Stream from '@hyperswarm/dht-relay/ws'

const port = process.env.PORT || 3400;

const server = http.createServer(express)

const dht = new DHT()

const wss = new WebSocketServer({server})

wss.on('connection', function (ws) {
  relay(dht, new Stream(false, ws))
})

server.listen(port, function (){
  console.log(`Listening at: ws://localhost:${port}`);
})
