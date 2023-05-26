# hello-peers
LocalFirst P2P with Holepunch's eco-system served over websockets
## Relay Server

1. Hyperswarm (a [Kademlia DHT](https://www.youtube.com/watch?v=1QdKhNpsj8M) with [hole-punching](https://www.geeksforgeeks.org/nat-hole-punching-in-computer-network/) builtin)

When you create a p2p connection (like with WebRTC) you typically need a "signaling server" to arrange the connection.
Hyperswarm replaces that server with a distributed signaling system.

2. HyperDHT ( the Distributed Hash Table powering Hyperswarm built on top of [dht-rpc](https://github.com/mafintosh/dht-rpc))

Mainly used to facilitate finding and connecting to peers using end-to-end encrypted Noise streams.
In the HyperDHT, peers are identified by a public key, not by an IP address. If you know someone's public key.
you can connect to them regardless of where they're located, even if they move between different networks

3. Hyperswarm Relay (Relaying the Hyperswarm DHT over framed streams to bring decentralized networking to everyone.)

The protocol is versioned and built on top of [protomux](https://github.com/mafintosh/protomux).
