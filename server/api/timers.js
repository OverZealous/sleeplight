const timers = require('../lib/timers');
const ValidationError = require('../lib/ValidationError');
const NotFoundError = require('../lib/NotFoundError');

module.exports.init = (router) => {

	function sendTimers(res) {
		res.json({
			enabled: timers.enabled, timers: timers.list
		});
	}

	function sendTimer(res, id) {
		res.json({
			timer: timers.get(id),
		});
	}

	router.route('/timers')
		.get((req, res) => {
			sendTimers(res);
		})
		.post((req, res, next) => {
			timers.add(req.body)
				.then((timer) => {
					sendTimer(res, timer.id);
				})
				.catch(next);
		});

	router.route('/timers/enable')
		.post((req, res) => {
			timers.enabled = true;
			sendTimers(res);
		});

	router.route('/timers/disable')
		.post((req, res) => {
			timers.enabled = false;
			sendTimers(res);
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
