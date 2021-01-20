const wait = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

const EventBus = function() {
	const types = {};
	const build = (type) => {
		if(!types[type]) {
			types[type] = new Set();
		}
	}

	this.add = (type, callback) => {
		build(type);
		types[type].add(callback);
	};

	this.remove = (type, callback) => {
		build(type);
		types[type].delete(callback);
	};

	this.trigger = (event) => {
		if(types[event.type] instanceof Set) {
			types[event.type].forEach((callback) => callback(event.data));
		}
	};
};

const isSupported = () => (
	"WebSocket" in window
);

module.exports = {
	wait,
	EventBus,
	isSupported
};
