const EventBus = require('./eventBus');

describe('EventBus', () => {

	it('should register and call event', () => {
		const eventBus = new EventBus();
		const callback = jest.fn();
		eventBus.on('mock', callback);

		eventBus.trigger({
			type: 'mock',
			data: 'fake'
		});

		expect(callback).toHaveBeenCalledWith('fake')
	});

	it('should not call event when triggered other type', () => {
		const eventBus = new EventBus();
		const callback = jest.fn();
		eventBus.on('mock', callback);

		eventBus.trigger({
			type: 'wrongMock',
			data: 'fake'
		});

		expect(callback).not.toHaveBeenCalled();
	});

	it('should call two callbacks', () => {
		const eventBus = new EventBus();
		const one = jest.fn();
		const two = jest.fn();
		eventBus.on('mock', one);
		eventBus.on('mock', two);

		eventBus.trigger({
			type: 'mock',
			data: 'fake'
		});

		expect(one).toHaveBeenCalledWith('fake')
		expect(two).toHaveBeenCalledWith('fake')
	});

	it('should not call callback after unregister', () => {
		const eventBus = new EventBus();
		const callback = jest.fn();
		eventBus.on('mock', callback);

		eventBus.trigger({
			type: 'mock',
			data: 'fake'
		});

		expect(callback).toHaveBeenCalledWith('fake');

		callback.mockClear();

		eventBus.off('mock', callback);

		eventBus.trigger({
			type: 'mock',
			data: 'fake'
		});

		expect(callback).not.toHaveBeenCalled();
	});

});
