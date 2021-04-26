# another-ws-server

![build](https://github.com/jakubrwisniewski/another-ws-server/actions/workflows/build.yml/badge.svg?branch=master)

Simple websocket server with multi-client and multi-scope support. Built up on `websocket` package.

## How multi-client support works?

Server receives message from client and broadcasts it to all connected clients (besides the one who sends the message).

## How multi-scope works?

You need only a single websocket server and you can connect multiple projects (scopes) and send messages for clients within scope.
This means, messages from one project won't be send to another.

## How to use server
```js
const Server = require('@jkob/another-ws-server/server');
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
const Client = require('@jkob/another-ws-server/client');
const client = new Client({
	host: 'ws://...',
	protocol: 'echo-protocol',
	pid: 'project-id'
});
await client.connect();

client.send('chat:message', 'Your Message');

client.on('chat:message', (message) => {
	console.log('Message', message);
});

client.close();
```


## How to use web client
```js
const WebClient = require('@jkob/another-ws-server/webClient');
const webClient = new WebClient({
	host: 'ws://...',
	protocol: 'echo-protocol',
	pid: 'project-id'
});

await webClient.connect();

webClient.send('chat:message', 'Your message from browser');

webClient.on('chat:message', (message) => {
	console.log('Message', message);
});

webClient.close();
```
