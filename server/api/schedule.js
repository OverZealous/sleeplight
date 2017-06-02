const sched = require('../lib/schedule');

function sendScheduleData(res) {
	const scheduleData = {
		enabled: sched.enabled,
		schedule: sched.schedule,
		days: sched.SCHEDULE_DAYS,
		events: sched.SCHEDULE_EVENTS,
	};
	res.json(scheduleData);
}

module.exports.init = (router) => {
	router.get('/schedule', (req, res) => {
		sendScheduleData(res);
	});

	router.post('/schedule/reset', (req, res, next) => {
		sched.reset()
			.then(() => sendScheduleData(res))
			.catch(next);
	});

	router.post('/schedule/enable', (req, res, next) => {
		sched.setEnabled(true)
			.then(() => sendScheduleData(res))
			.catch(next);
	});

	router.post('/schedule/disable', (req, res, next) => {
		sched.setEnabled(false)
			.then(() => sendScheduleData(res))
			.catch(next);
	});

	router.post(`/schedule/:days(${sched.SCHEDULE_DAYS.join('|')})/:event(${sched.SCHEDULE_EVENTS.join('|')})/:time`, (req, res, next) => {
		sched.updateSchedule(req.params.days, req.params.event, req.params.time)
			.then(() => sendScheduleData(res))
			.catch(next);
	});
};
