class ValidationError extends Error {
	constructor(...args) {
		super(...args);
	}
}

module.exports = ValidationError;
