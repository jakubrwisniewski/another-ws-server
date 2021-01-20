const { EventType, MessageMethod, MessageType } = require('./types');

const isAllowed = (allowedOrigins, origin) => {
	return !Array.isArray(allowedOrigins) || allowedOrigins.length === 0 || allowedOrigins.includes(origin);
};

const time = () => {
	const date = new Date();
	return date.toLocaleTimeString('pl-PL');
};

const log = (message) => {
	console.log(`[${time()}]: ${message}`);
};

const processMessageData = (message) => {
	if(message.type === MessageType.Utf) {
		return [message.utf8Data, MessageType.Utf];
	}

	if(message.type === MessageType.Binary) {
		return [message.binaryData, MessageType.Binary];
	}

	return [null];
};

const sendMessageToClients = (current, clients, messageData, messageType) => {
	const messageMethod = MessageMethod[messageType];

	[...clients.values()]
		.filter((client) => {
			return client.pid === current.pid && client !== current;
		})
		.forEach((client) => {
			log(`Message ${messageData} sent to #${client.id} [${client.pid}]`);
			client[messageMethod](messageData);
		});
};

const resolvePid = (message) => {
	try {
		const event = JSON.parse(message);
		if(event?.type === EventType.Init) {
			return event?.data?.pid || false;
		}
	}
	catch(e) {}

	return false;
};

module.exports = {
	isAllowed,
	log,
	processMessageData,
	sendMessageToClients,
	resolvePid
};
