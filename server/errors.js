const path = require('path');

module.exports.init = (router) => {
	router.get('*', function(req, res, next) {
		const err = new Error();
		err.status = 404;
		next(err);
	});

	router.use(function errorHandler(err, req, res, next) {
		if(err && err.status !== 404) {
			console.error(err);
			res.status(err.status || 500).sendFile(path.join(__dirname, '..', 'client', '500.html'));
		} else {
			res.status(404).sendFile(path.join(__dirname, '..', 'client', '404.html'));
		}
	});
};
