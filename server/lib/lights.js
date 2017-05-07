const Promise = require('bluebird');
const STATES = [
	{ id: 'off', label: 'Off', color: '#333' },
	{ id: 'red', label: 'Red', color: '#A00' },
	{ id: 'yellow', label: 'Yellow', color: '#CC4' },
	{ id: 'green', label: 'Green', color: '#0A0' },
];

const STATE_MAP = {};
STATES.forEach(s => STATE_MAP[s.id] = s);

let lastState = STATE_MAP.off;

module.exports = {
	STATES,
	STATE_MAP,
	get currentState() { return lastState },
	setState(state) {
		return Promise.resolve()
			.then(() => {
				let foundState = !!state && STATES.find(s => s.id === state || s.id === state.id);
				if(!foundState) {
					throw new Error('Unable to find state: ' + JSON.stringify(state));
				}
				// TODO: handle the wiring changes
				console.log("disabling state ", lastState.label);
				lastState = foundState;
				console.log("turning on state ", lastState.label);

				return lastState;
			});
	},
};
