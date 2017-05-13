const parent = require('../lib/parents');

function sendParentsData(res) {
	const parentsData = {
		parents: parent.PARENTS,
		currentParent: parent.currentParent.id,
	};
	res.json(parentsData);
}

module.exports.init = (router) => {
	router.get('/parents', (req, res) => {
		sendParentsData(res);
	});

	router.post('/parents/:parent', (req, res, next) => {
		parent.setParent(req.params.parent)
			.then(() => sendParentsData(res))
			.catch(next);
	});
};
