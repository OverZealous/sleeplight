const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
let data = null;

const dataFile = path.join(__dirname, '..', 'data.json');

const exists = fs.existsSync(dataFile);
if(exists) {
	try {
		data = require(dataFile);
	} catch(ex) {
		console.log('ERROR: Bad Data File');
		fs.unlinkSync(dataFile);
	}
}
if(!data) {
	data = require('../default-data.json');
}

function save() {
	return fs.writeFileAsync(dataFile, JSON.stringify(data), { mode: 0o777 });
}

Object.defineProperties(data, {
	save: {
		value: save,
	},
	get: {
		value: (path, defaultValue = null) => {
			return _.get(data, path, defaultValue);
		},
	},
	set: {
		value: (path, value = null) => {
			_.set(data, path, value);
			return save();
		},
	},
});

module.exports = data;