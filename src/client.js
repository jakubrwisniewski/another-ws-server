const WebSocketClient = require('websocket').client;
const { log } = require('./lib/utils');
const { MessageType, EventType } = require('./lib/types');
const EventBus = require('./lib/eventBus');

const Client = function(options) {
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

	this.connect = () => {
		const client = new WebSocketClient();

		client.on('connectFailed', (error) => {
			options.logging && log(`Client connect error: ${error.toString()}`);
		});

		return new Promise((resolve) => {
			client.on('connect', (connection) => {
				_connection = connection;

				connection.on('close', () => {
					_connection = null;
					options.logging && log('Disconnected');
				});

				connection.on('error', (error) => {
					options.logging && log(`Connection error: ${error.toString()}`);
				});

				connection.on('message', processMessage);

				send(EventType.Init, {
					scope: options.scope
				});

				resolve();
			});

			client.connect(options.host, options.protocol);
		});
	};

	this.close = () => {
		if(_connection?.close) {
			_connection.close();
		}
	};

	this.send = (type, data) => {
		send(type, data);
	};

	this.on = (type, callback) => {
		bus.on(type, callback);
	};

	this.off = (type, callback) => {
		bus.off(type, callback);
	};
};

module.exports = Client;
