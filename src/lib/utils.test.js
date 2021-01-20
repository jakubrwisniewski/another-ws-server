const { log, isAllowed, processMessageData, sendMessageToClients, resolvePid } = require('./utils');
const { MessageType } = require('./types');

global.console.log = jest.fn();

describe('log', () => {

	const date = new Date(2021, 0, 10, 12, 34, 43);
	jest.spyOn(global, 'Date').mockImplementation(() => date);

	beforeEach(() => {
		console.log.mockClear();
	})

	it('should returns message with time', () => {
		log('message');
		expect(console.log).toHaveBeenCalledWith('[12:34:43]: message');
	});

});

describe('isAllowed', () => {

	it('should returns true when allowedOrigins is not array', () => {
		let result;
		result = isAllowed(1, '');
		expect(result).toBe(true);
		result = isAllowed('', '');
		expect(result).toBe(true);
		result = isAllowed({}, '');
		expect(result).toBe(true);
	});

	it('should returns true when allowedOrigins is empty', () => {
		const result = isAllowed([], '');
		expect(result).toBe(true);
	});

	it('should returns false when called with not allowed origin', () => {
		const allowedOrigins = ['allowedOrigin'];
		const result = isAllowed(allowedOrigins, 'notAllowedOrigin');
		expect(result).toBe(false);
	});

	it('should returns true when called with allowed origin', () => {
		const allowedOrigins = ['allowedOrigin'];
		const result = isAllowed(allowedOrigins, 'allowedOrigin');
		expect(result).toBe(true);
	});

});

describe('processMessageData', () => {

	const message = {
		type: null,
		utf8Data: 'utf data',
		binaryData: 'binary data'
	};

	it('should returns null for unsupported message', () => {
		const [result] = processMessageData(message);
		expect(result).toBe(null);
	});

	it('should returns utf8 message data', () => {
		message.type = MessageType.Utf;
		const [data, type] = processMessageData(message);
		expect(data).toBe('utf data');
		expect(type).toBe('utf8');
	});

	it('should returns binary message data', () => {
		message.type = MessageType.Binary;
		const [data, type] = processMessageData(message);
		expect(data).toBe('binary data');
		expect(type).toBe('binary');
	});

});

describe('sendMessageToClients', () => {

	const clients = new Map();
	const getFakeClient = (pid) => ({
		remoteAddr: 'fake',
		sendUTF: jest.fn(),
		sendBytes: jest.fn(),
		pid: pid
	});

	const clearClient = (client) => {
		client.sendUTF.mockClear();
		client.sendBytes.mockClear();
	}

	const one = getFakeClient(1);
	const two = getFakeClient(1);
	const three = getFakeClient(1);
	const four = getFakeClient(2);
	const five = getFakeClient(2);

	beforeEach(() => {
		clients.clear();
		clearClient(one);
		clearClient(two);
		clearClient(three);
		clearClient(four);
		clearClient(five);
	});

	it('should send message to client two only', () => {
		clients.set(one, one);
		clients.set(two, two);
		clients.set(four, four);

		sendMessageToClients(one, clients, 'from one', MessageType.Utf);

		expect(two.sendUTF).toHaveBeenCalledWith('from one');
		expect(one.sendUTF).not.toHaveBeenCalled();
		expect(four.sendUTF).not.toHaveBeenCalled();
	});

	it('should send message to client one and two only', () => {
		clients.set(one, one);
		clients.set(two, two);
		clients.set(three, three);
		clients.set(four, four);

		sendMessageToClients(three, clients, 'from three', MessageType.Utf);

		expect(one.sendUTF).toHaveBeenCalledWith('from three');
		expect(two.sendUTF).toHaveBeenCalledWith('from three');
		expect(three.sendUTF).not.toHaveBeenCalled();
		expect(four.sendUTF).not.toHaveBeenCalled();
		expect(five.sendUTF).not.toHaveBeenCalled();
	});

	it('should send binary message to client one and two only', () => {
		clients.set(one, one);
		clients.set(two, two);
		clients.set(three, three);
		clients.set(four, four);

		sendMessageToClients(three, clients, '10010101', MessageType.Binary);

		expect(one.sendBytes).toHaveBeenCalledWith('10010101');
		expect(two.sendBytes).toHaveBeenCalledWith('10010101');
		expect(three.sendBytes).not.toHaveBeenCalled();
		expect(four.sendBytes).not.toHaveBeenCalled();
		expect(one.sendUTF).not.toHaveBeenCalled();
		expect(two.sendUTF).not.toHaveBeenCalled();
		expect(three.sendUTF).not.toHaveBeenCalled();
		expect(four.sendUTF).not.toHaveBeenCalled();
		expect(five.sendUTF).not.toHaveBeenCalled();
	});

	it('should send to clients with other pid', () => {
		clients.set(one, one);
		clients.set(two, two);
		clients.set(three, three);
		clients.set(four, four);
		clients.set(five, five);

		sendMessageToClients(four, clients, 'from four', MessageType.Utf);

		expect(five.sendUTF).toHaveBeenCalledWith('from four');
		expect(four.sendUTF).not.toHaveBeenCalled();
		expect(one.sendUTF).not.toHaveBeenCalled();
		expect(two.sendUTF).not.toHaveBeenCalled();
		expect(three.sendUTF).not.toHaveBeenCalled();
		expect(four.sendUTF).not.toHaveBeenCalled();
	});

});

describe('resolvePid', () => {

	it('should returns false when called with no json', () => {
		const result = resolvePid('str');
		expect(result).toBe(false);
	});

	it('should returns false when called with wrong type', () => {
		const json = JSON.stringify({
			event: 'fake'
		});
		const result = resolvePid(json);
		expect(result).toBe(false);
	});

	it('should returns false when called without data', () => {
		const json = JSON.stringify({
			event: 'init'
		});
		const result = resolvePid(json);
		expect(result).toBe(false);
	});

	it('should returns false when called without pid in data', () => {
		const json = JSON.stringify({
			event: 'init',
			data: {}
		});
		const result = resolvePid(json);
		expect(result).toBe(false);
	});

	it('should returns PID when called with pid', () => {
		const json = JSON.stringify({
			type: 'init',
			data: { pid: 'PID' }
		});
		const result = resolvePid(json);
		expect(result).toBe('PID');
	});

});
