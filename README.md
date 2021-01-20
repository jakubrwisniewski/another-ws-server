# node-ws
Simple websocket server with multiclients support


## How to use server

```js
const { Server } = require('node-ws');
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
const { Client } = require('node-ws');
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
const { WebClient } = require('node-ws');
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
