const dataStore = require('./data-store');
const Promise = require('bluebird');
const ValidationError = require('./ValidationError');
const sockets = require('./sockets');

const STATES = [
	{ id: 'off', label: 'Off', color: '#000' },
	{ id: 'red', label: 'Red', color: '#9c2522' },
	{ id: 'yellow', label: 'Yellow', color: '#ccb747' },
	{ id: 'green', label: 'Green', color: '#0e9c0e' },
];

const STATE_MAP = {};
STATES.forEach(s => STATE_MAP[s.id] = s);

let lastState = STATE_MAP[dataStore.light];
if(!lastState) {
	lastState = STATE_MAP.off;
}

module.exports = {
	STATES,
	STATE_MAP,
	get currentState() { return lastState },
	setState(state) {
		return Promise.resolve()
			.then(() => {
				let foundState = !!state && STATES.find(s => s.id === state || s.id === state.id);
				if(!foundState) {
					throw new ValidationError('Unable to find state: ' + JSON.stringify(state));
				}

				// TODO: handle the wiring changes
				console.log("disabling state ", lastState.label);
				lastState = foundState;
				console.log("turning on state ", lastState.label);

				dataStore.set('light', lastState.id);

				sockets.io.emit('light', lastState.id);

				return lastState;
			});
	},
};
