const ValidationError = require('../lib/ValidationError');
const NotFoundError = require('../lib/NotFoundError');

module.exports.init = (app) => {
	app.get('*', function(req, res, next) {
		const err = new Error();
		err.status = 404;
		next(err);
	});

	app.use(function errorHandler(err, req, res, next) {
		if(err instanceof ValidationError) {
			console.error(err);
			res.status(err.status).json({ error: err.message || 'Invalid Input' });
		} else if(err instanceof NotFoundError) {
			console.error(err);
			res.status(err.status).json({ error: err.message || 'Not Found' });
		} else if(err && err.status !== 404) {
			console.error(err);
			res.status(err.status || 500).json({ error: err.message || 'Server Error' });
		} else {
			res.status(404).json({ error: 'Not Found' });
		}
	});
};
