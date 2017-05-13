const dataStore = require('./data-store');
const Promise = require('bluebird');
const ValidationError = require('./ValidationError');

const PARENTS = [
	{ id: 'mom', label: 'Mom', color: '#a4595e' },
	{ id: 'dad', label: 'Dad', color: '#4355aa' },
];

const PARENT_MAP = {};
PARENTS.forEach(s => PARENT_MAP[s.id] = s);

let lastParent = PARENT_MAP[dataStore.parent];
if(!lastParent) {
	lastParent = PARENT_MAP.mom;
}

module.exports = {
	PARENTS,
	PARENT_MAP,
	get currentParent() { return lastParent },
	setParent(parent) {
		return Promise.resolve()
			.then(() => {
				let foundParent = !!parent && PARENTS.find(s => s.id === parent || s.id === parent.id);
				if(!foundParent) {
					throw new ValidationError('Unable to find parent: ' + JSON.stringify(parent));
				}

				// TODO: handle the wiring changes
				console.log("switching away from parent ", lastParent.label);
				lastParent = foundParent;
				console.log("switching to parent ", lastParent.label);

				dataStore.set('parent', lastParent.id);

				return lastParent;
			});
	},
};
