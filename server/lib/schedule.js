const dataStore = require('./data-store');
const Promise = require('bluebird');
const ValidationError = require('./ValidationError');
const sockets = require('./sockets');
const lights = require('./lights');


//--------------------------------------------------------------------------------------------------------------
// Constants
//--------------------------------------------------------------------------------------------------------------

const TIME_VALIDATION = /^(2[0-3]|[01]?\d):[0-5]\d$/;

const SCHEDULE_DAYS = [
	'weekdays', 'weekends',
];

const DAYS_MAP = [
	'weekends', // Sunday
	'weekdays', // Monday
	'weekdays', // Tuesday
	'weekdays', // Wednesday
	'weekdays', // Thursday
	'weekdays', // Friday
	'weekends', // Saturday
];

const SCHEDULE_EVENTS = [
	'wake', 'play', 'off', 'bedtime', 'sleep',
];

const EVENTS_TO_LIGHTS_MAP = {
	wake: 'yellow',
	play: 'green',
	off: 'off',
	bedtime: 'yellow',
	sleep: 'red',
};

//--------------------------------------------------------------------------------------------------------------
// Timer Scheduling
//--------------------------------------------------------------------------------------------------------------

let nextTimer = null;

/**
 * Schedules the next event timer, unless the schedule is currently disabled.
 * @returns {string} Whatever should be the current timer event
 */
function scheduleNextTimer() {
	if(!dataStore.scheduleEnabled) return;
	if(nextTimer) {
		clearTimeout(nextTimer);
	}
	const now = new Date();
	const nowTime = now.getTime();
	const then = new Date(now.getTime());
	then.setSeconds(0);
	then.setMilliseconds(0);
	const daySchedule = dataStore.schedule[DAYS_MAP[now.getDay()]];
	if(!daySchedule) {
		throw new ValidationError('Invalid Schedule Data!');
	}

	const _scheduleTimer = (event, when) => {
		let delay = when - nowTime;
		console.log(`Scheduling ${event} in ${Math.floor(delay / 1000)}s (at ${new Date(when)})`);
		nextTimer = setTimeout(() => {
			lights.setState(EVENTS_TO_LIGHTS_MAP[event]);
			// schedule next event
			scheduleNextTimer();
		}, delay);
	};

	// we set current to sleep to allow for wrap-around events
	let current = 'sleep';

	for(let event of SCHEDULE_EVENTS) {
		// figure out the next event by time
		const timeParts = daySchedule[event].split(':').map(Number);
		then.setHours(timeParts[0]);
		then.setMinutes(timeParts[1]);
		let thenTime = then.getTime();
		if(thenTime > nowTime) {
			_scheduleTimer(event, thenTime);
			break;
		} else {
			current = event;
		}
	}
	if(!nextTimer) {
		// next timer is morning, so schedule that
		const timeParts = daySchedule.wake.split(':').map(Number);
		then.setHours(timeParts[0]);
		then.setMinutes(timeParts[1]);
		let tomorrow = new Date(then.getTime() + 24 * 60 * 60 * 1000);
		_scheduleTimer('wake', tomorrow.getTime());
	}

	return current;
}

// initialize the schedule
let current = scheduleNextTimer();
if(current) {
	process.nextTick(() => lights.setState(EVENTS_TO_LIGHTS_MAP[current]));
}


//--------------------------------------------------------------------------------------------------------------
// Public API
//--------------------------------------------------------------------------------------------------------------

module.exports = {
	SCHEDULE_DAYS,
	SCHEDULE_EVENTS,
	EVENTS_TO_LIGHTS_MAP,
	get schedule() {
		return dataStore.schedule;
	},
	get enabled() {
		return !!dataStore.scheduleEnabled;
	},
	setEnabled(val) {
		let promise = Promise.resolve(dataStore.scheduleEnabled);
		if(val && (!dataStore.scheduleEnabled || !nextTimer)) {
			promise = dataStore.set('scheduleEnabled', true)
				.then(() => {
					sockets.io.emit('scheduleEnabled', true);
					scheduleNextTimer();
					return true;
				});
		} else if(!val && (dataStore.scheduleEnabled || nextTimer)) {
			console.log('Disabling scheduled events');
			clearTimeout(nextTimer);
			promise = dataStore.set('scheduleEnabled', false)
				.then(() => {
					sockets.io.emit('scheduleEnabled', false);
					return false;
				});
		}
		return promise;
	},
	updateSchedule(days, event, time) {
		return Promise.resolve()
			.then(() => {
				if(SCHEDULE_DAYS.indexOf(days) === -1) {
					throw new ValidationError('Invalid Schedule Days: ' + days);
				}
				if(SCHEDULE_EVENTS.indexOf(event) === -1) {
					throw new ValidationError('Invalid Schedule Event: ' + event);
				}
				if(!TIME_VALIDATION.test(time)) {
					throw new ValidationError('Invalid Schedule Time: ' + time);
				}

				// todo: validate timer order?

				dataStore.schedule[days][event] = time;
				sockets.io.emit('schedule', dataStore.schedule);
				return dataStore.save()
					.then(scheduleNextTimer);
			});
	},

	reset() {
		return dataStore.reset('schedule')
			.then(scheduleNextTimer);
	},
};
