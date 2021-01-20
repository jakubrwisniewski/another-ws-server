const wait = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

const isSupported = () => (
	"WebSocket" in window
);

module.exports = {
	wait,
	isSupported
};
