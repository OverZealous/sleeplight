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

function clearNextTimer() {
	if(nextTimer) {
		clearTimeout(nextTimer);
		nextTimer = null;
	}
}

/**
 * Schedules the next event timer, unless the schedule is currently disabled.
 * @returns {string} Whatever should be the current timer event
 */
function scheduleNextTimer() {
	if(!dataStore.scheduleEnabled) {
		console.log('Schedule disabled.')
		return null;
	}
	clearNextTimer();
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
		const tomorrow = new Date(Date.now() + (24 * 60 * 60 * 1000))
		tomorrow.setSeconds(0);
		tomorrow.setMilliseconds(0);
		const tomorrowSchedule = dataStore.schedule[DAYS_MAP[tomorrow.getDay()]];
		// next timer is morning, so schedule that
		const timeParts = tomorrowSchedule.wake.split(':').map(Number);
		tomorrow.setHours(timeParts[0]);
		tomorrow.setMinutes(timeParts[1]);
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
					scheduleNextTimer();
					sockets.io.emit('scheduleEnabled', true);
					return true;
				});
		} else if(!val && (dataStore.scheduleEnabled || nextTimer)) {
			console.log('Disabling scheduled events');
			clearNextTimer();
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
