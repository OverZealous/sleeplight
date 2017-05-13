const timers = require('../lib/timers');
const ValidationError = require('../lib/ValidationError');
const NotFoundError = require('../lib/NotFoundError');

module.exports.init = (router) => {

	function sendTimer(res, id) {
		res.json({
			data: timers.get(id),
		});
	}

	router.route('/timers')
		.get((req, res) => {
			res.json({ data: timers.list });
		})
		.post((req, res, next) => {
			timers.add(req.body)
				.then((timer) => {
					sendTimer(res, timer.id);
				})
				.catch(next);
		});

	router.route('/timers/:timerId')
		.get((req, res) => {
			sendTimer(res, req.params.timerId);
		})
		.put((req, res, next) => {
			timers.update(req.params.timerId, req.body)
				.then((timer) => {
					sendTimer(res, timer.id);
				})
				.catch(next);
		})
		.delete((req, res, next) => {
			timers.remove(req.params.timerId)
				.then(() => res.status(204).send())
				.catch(next);
		});
};
