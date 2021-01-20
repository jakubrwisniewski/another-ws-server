# another-ws-server
Simple websocket server with multi-client and separate projects support. Built up on `websocket` package.

## How multi-client support works?

Server receives message from client and broadcasts it to all connected clients (besides the one who sends the message).

## How separate projects work?

You need only a single websocket server to handle multiple projects separately. This is achieved by `pid` flag passed with options.
How it works? When clients sends a message to server, server recognize its pid. Server broadcast this message to other clients with the same pid. Other clients (from other projects) won't receive this message.

## How to use server

```js
const { Server } = require('another-ws-server');
const server = new Server({
	allowedOrigins: [], // allow all if empty or missing
	protocol: 'echo-protocol',
	port: 8080
});
await server.start();
...
server.stop();
```


## How to use client
```js
const { Client } = require('another-ws-server');
const client = new Client({
	host: 'ws://...',
	protocol: 'echo-protocol',
	pid: 'project-id'
});
await client.connect();

client.send('chat:message', 'Your Message');

client.addListener('chat:message', (message) => {
	console.log('Message', message);
});
```


## How to use web client
```js
const { WebClient } = require('another-ws-server');
const webClient = new WebClient({
	host: 'ws://...',
	protocol: 'echo-protocol',
	pid: 'project-id'
});

await webClient.connect();

webClient.send('chat:message', 'Your message from browser');

webClient.addListener('chat:message', (message) => {
	console.log('Message', message);
});
```
