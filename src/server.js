const WebSocketServer = require('websocket').server;
const http = require('http');
const { isAllowed, log, resolvePid, processMessageData, sendMessageToClients } = require('./lib/utils');

const Server = function(options) {
	const server = http.createServer((request, response) => {
		log(`Received request for ${request.url}`);
		response.writeHead(404);
		response.end();
	});

	let id = 0;
	const clients = new Map();

	const processMessage = (client, message) => {
		const [messageData, messageType] = processMessageData(message);

		if(!messageData) {
			log('Invalid message data');
			return;
		}

		if(!client.pid) {
			client.pid = resolvePid(messageData);
			log(`#${client.id} bind to ${client.pid}`);
			return;
		}

		sendMessageToClients(client, clients, messageData, messageType);
	};

	const processRequest = (request) => {
		if(!isAllowed(options.allowedOrigins, request.origin)) {
			log(`Connection from ${request.origin} was rejected`);
			request.reject();
			return;
		}

		const client = request.accept(options.protocol, request.origin);
		client.id = ++id;
		clients.set(client, client);
		log(`#${client.id} ${client.remoteAddress} connected from ${request.origin}`);

		client.on('message', (message) => processMessage(client, message));

		client.on('close', () => {
			clients.delete(client);
			log(`${client.id} disconnected`);
		});
	};

	this.start = () => {
		server.listen(options.port, () => {
			log(`HTTP server is running on ${options.port}`);
		});

		const wsServer = new WebSocketServer({
			httpServer: server,
			autoAcceptConnections: false
		});

		wsServer.on('request', processRequest);
	};

	this.stop = () => {
		wsServer.shutDown();
		server.close();
	};
};

module.exports = Server;
