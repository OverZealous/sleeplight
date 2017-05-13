const schedule = require('node-schedule');
const cronParser = require('cron-parser');
const Promise = require('bluebird');
const dataStore = require('../lib/data-store');
const lights = require('../lib/lights');
const ValidationError = require('../lib/ValidationError');
const NotFoundError = require('../lib/NotFoundError');

if(dataStore.timers) {
	dataStore.timers.forEach((t, index) => t.id = index);
}

// TODO: schedule timers
// TODO: initialize current light state

function validate(timerData, isNew) {
	const keys = ['schedule', 'state'];
	const newTimer = {};
	keys.forEach(k => {
		if(timerData[k] !== undefined) {
			newTimer[k] = timerData[k];
		}
	});
	if(isNew && !(newTimer.schedule || newTimer.state)) {
		throw new ValidationError('Missing required data');
	}
	if(newTimer.state && !lights.STATE_MAP[newTimer.state]) {
		throw new ValidationError('Invalid State');
	}
	if(newTimer.schedule) {
		try {
			cronParser.parseExpression(newTimer.schedule);
		} catch(err) {
			throw new ValidationError('Invalid schedule expression: ' + err.message);
		}
	}
	return newTimer;
}

let timers = module.exports = {
	get list() {
		if(!dataStore.timers) {
			dataStore.set('timers', []);
		}
		return dataStore.timers;
	},

	get(id) {
		let index = +id;
		let timer = timers.list[index];
		if(isNaN(index) || index % 1 || index < 0 || !timer) {
			throw new NotFoundError(`Timer not found for id "${id}"`);
		}
		return timer;
	},

	add(timerData) {
		// TODO: prevent collisions
		// TODO: schedule timer
		return Promise.resolve()
			.then(() => {
				let newTimer = validate(timerData, true);
				newTimer.id = timers.list.length;
				timers.list.push(newTimer);
				return dataStore.save()
					.then(() => newTimer);
			});
	},
	update(id, changes) {
		// TODO: prevent collisions
		// TODO: re-schedule timer
		let timer = timers.get(id);
		return Promise.resolve()
			.then(() => {
				let newData = validate(changes, false);
				Object.assign(timer, newData);
				return dataStore.save()
					.then(() => timer);
			});
	},
	remove(id) {
		let timer = timers.get(id);
		// TODO: unschedule timer
		let index = +id;
		timers.list.splice(index);
		return dataStore.save()
			.then(() => timer);
	},
};
