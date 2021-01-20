const WebSocketClient = require('websocket').client;
const log = require('./utils');
const { MessageType, EventType } = require('./types');
const { EventBus } = require('./webUtils');

const Client = function(options) {
	const client = new WebSocketClient();
	const bus = new EventBus();

	let _connection = null;

	const processMessage = (message) => {
		if(message.type === MessageType.Utf) {
			const event = JSON.parse(message.utf8Data)
			bus.trigger(event);
		}
	};

	const send = (type, data) => {
		if(_connection?.connected) {
			const event = JSON.stringify({ type, data });
			_connection.sendUTF(event);
		}
	};

	client.on('connectFailed', (error) => {
		log(`Client connect error: ${error.toString()}`);
	});

	this.connect = () => {
		return new Promise((resolve) => {
			client.on('connect', (connection) => {
				_connection = connection;

				connection.on('close', () => {
					_connection = null;
					log('Disconnected');
				});

				connection.on('error', (error) => {
					log(`Connection error: ${error.toString()}`);
				});

				connection.on('message', processMessage);

				send(EventType.Init, {
					pid: options.pid
				});

				resolve();
			});

			client.connect(options.host, options.protocol);
		});
	};

	this.send = (type, data) => {
		send(type, data);
	};

	this.addListener = (type, callback) => {
		bus.add(type, callback);
	};

	this.removeListener = (type, callback) => {
		bus.remove(type, callback);
	};
};

module.exports = Client;
