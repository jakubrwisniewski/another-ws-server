const EventBus = function() {
	const types = {};
	const build = (type) => {
		if(!types[type]) {
			types[type] = new Set();
		}
	}

	this.on = (type, callback) => {
		build(type);
		types[type].add(callback);
	};

	this.off = (type, callback) => {
		build(type);
		types[type].delete(callback);
	};

	this.trigger = (event) => {
		if(types[event.type] instanceof Set) {
			types[event.type].forEach((callback) => callback(event.data));
		}
	};
};

module.exports = EventBus;
