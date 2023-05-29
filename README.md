# hello-peers
A demo for localFirst P2P with Holepunch's eco-system in the browser; served over websockets and styled with tailwindcss

![alt text](https://github.com/jermsam/hello-peers/blob/main/browser-todo-app-with-hypercores.png)

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

## Data Management
1. Hypercore (a secure, distributed [append-only log](https://en.wikipedia.org/wiki/Append-only) built for sharing large datasets and streams of real-time data)

A Hypercore can only be modified by its creator; internally it signs updates with a private key that's meant to live on a single machine, and should never be shared. However, the writer can replicate to many readers, in a manner similar to BitTorrent but Unlike BitTorrent, a Hypercore can be modified after its initial creation, and peers can receive live update notifications whenever the writer adds new blocks.

2. Hyperbee (an append only [B-tree](https://www.educba.com/b-tree-in-data-structure/) based on Hypercore.

It uses a single Hypercore for storage, using a technique called [embedded indexing](https://www.luciehaskins.com/resources/Mauer_EmbeddedIndexing.pdf)
As with the Hypercore, a Hyperbee can only have a single writer on a single machine; the creator of the Hyperdrive is the only person who can modify it because they're the only one with the private key. That said, the writer can replicate to many readers, as described in the Hypercore.

3. Autobase (experimental module used to transform higher-level data structures (like Hyperbee) into multiwriter data structures with minimal additional work)

Autobase is used to automatically rebase multiple causally-linked Hypercores into a single, linearized Hypercore. 

4. Hyperdeebee (a MongoDB-like database built on top of Hyperbee with support for indexing based on [Hyperbee Indexed DB](https://gist.github.com/RangerMauve/ae271204054b62d9a649d70b7d218191))

