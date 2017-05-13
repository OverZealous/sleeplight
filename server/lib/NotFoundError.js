class NotFoundError extends Error {
	constructor(...args) {
		super(...args);
		this.status = 404;
	}
}

module.exports = NotFoundError;
