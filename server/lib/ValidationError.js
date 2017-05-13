class ValidationError extends Error {
	constructor(...args) {
		super(...args);
		this.status = 422;
	}
}

module.exports = ValidationError;
