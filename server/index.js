"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
// @ts-ignore
const hyperdht_1 = __importDefault(require("hyperdht"));
// @ts-ignore
const dht_relay_1 = require("@hyperswarm/dht-relay");
// @ts-ignore
const ws_2 = __importDefault(require("@hyperswarm/dht-relay/ws"));
const port = process.env.PORT || 3000;
const server = http_1.default.createServer(express_1.default);
const dht = new hyperdht_1.default();
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', function (ws) {
    (0, dht_relay_1.relay)(dht, new ws_2.default(false, ws));
});
server.listen(port, function () {
    console.log(`Listening at: ws://localhost:${port}`);
});
