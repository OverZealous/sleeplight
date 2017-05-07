const lights = require('../lib/lights');

function sendState(res) {
	const lightsData = {
		lightStates: lights.STATES,
		currentState: lights.currentState,
	};
	res.json(lightsData);
}

module.exports.init = (router) => {
	router.get('/lights', (req, res) => {
		sendState(res);
	});

	router.post('/lights/:state', (req, res) => {
		lights.setState(req.params.state)
			.then(() => sendState(res));
	});
};
