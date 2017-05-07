const timers = require('../lib/timers');
const ValidationError = require('../lib/ValidationError');

module.exports.init = (router) => {

	function send404(res) {
		res.status(404).send('404 Not Found');
	}

	function handleError(res) {
		return function(err) {
			if(err) {
				res.status(err instanceof ValidationError ? 422 : 500).send(err);
			} else {
				send404(res);
			}
		};
	}

	function sendTimer(res, id) {
		let timer = timers.get(id);
		if(!timer) {
			send404(res);
		} else {
			res.json({
				data: timer,
			});
		}
	}

	router.route('/timers')
		.get((req, res) => {
			res.json({ data: timers.list });
		})
		.post((req, res) => {
			timers.add(req.body)
				.then((timer) => {
					sendTimer(res, timer.id);
				})
				.catch(handleError(res));
		});

	router.route('/timers/:timerId')
		.get((req, res) => {
			sendTimer(res, req.params.timerId);
		})
		.put((req, res) => {
			timers.update(req.params.timerId, req.body)
				.then((timer) => {
					sendTimer(res, timer.id);
				})
				.catch(handleError(res));
		})
		.delete((req, res) => {
			timers.remove(req.params.timerId)
				.then(() => res.status(204).send())
				.catch(handleError(res));
		});
};
