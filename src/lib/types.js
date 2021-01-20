const EventType = {
	Init: 'init'
};

const MessageType = {
	Utf: 'utf8',
	Binary: 'binary'
};

const MessageMethod = {
	[MessageType.Binary]: 'sendBytes',
	[MessageType.Utf]: 'sendUTF'
};

module.exports = {
	EventType,
	MessageMethod,
	MessageType
};
