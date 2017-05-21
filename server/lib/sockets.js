const socketIo = require('socket.io');

module.exports = {
	io: null,
	init(server) {
		module.exports.io = socketIo(server);
		return module.exports.io;
	}
};
