const { wait, isSupported } = require('./lib/webUtils');
const EventBus = require('./lib/eventBus');
const { EventType } = require('./lib/types');

const Status = {
	Connected: 0,
	Disconnected: 0
};

const WebClient = function(options) {
	if(!isSupported()) {
		return;
	}

	const bus = new EventBus();
	let status = Status.Disconnected;
	let driver = null;
	let onConnected = null;
	let onDisconnected = null;

	const send = (type, data) => {
		if(status === Status.Connected && driver && driver.send) {
			const event = { type, data };
			driver.send(JSON.stringify(event));
		}
	};

	const connect = () => {
		return new Promise((resolve) => {
			driver = new WebSocket(options.host, options.protocol);

			driver.onerror = (error) => {
				console.error('WebSocker connection error', error);
				resolve(false);
			};

			driver.onopen = () => {
				status = Status.Connected;
				send(EventType.Init, {
					scope: options.scope
				});

				if(onConnected && typeof onConnected === "function") {
					onConnected();
				}

				resolve(true);
			};

			driver.onclose = (event) => {
				driver = null;
				status = Status.Disconnected;

				if(onDisconnected && typeof onDisconnected === "function") {
					onDisconnected();
				}

				if(!event.wasClean) {
					reconnect();
				}
			};

			driver.onmessage = (event) => {
				const busEvent = JSON.parse(event.data);
				bus.trigger(busEvent);
			};
		});
	};

	const reconnect = async () => {
		while(status !== Status.Connected) {
			await wait(3000);
			await connect();
		}
	};

	this.connect = async () => {
		await connect();
	};

	this.close = () => {
		status = Status.Disconnected;
		driver.close();
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

	this.trigger = (type, data) => {
		bus.trigger({ type, data });
	};

	this.isConnected = () => {
		return status === Status.Connected;
	};

	this.onConnect = (callback) => {
		if(callback) {
			onConnected = callback;
		}
	};

	this.onDisconnect = (callback) => {
		if(callback) {
			onDisconnected = callback;
		}
	}
};

WebClient.supported = isSupported;

module.exports = WebClient;
