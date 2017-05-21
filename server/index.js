const express = require('express');
const app = express();
const server = require('http').createServer(app);
require('./lib/sockets').init(server);
const bodyParser = require('body-parser');
const path = require('path');
const ValidationError = require('./lib/ValidationError');
const NotFoundError = require('./lib/NotFoundError');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;

const router = express.Router();

require('./api/parents').init(router);
require('./api/lights').init(router);
require('./api/timers').init(router);

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..', 'client')));

app.use(function errorHandler(err, req, res, next) {
	console.log('hi');
	if(err instanceof ValidationError) {
		console.log(err);
		res.status(err.status).json({ error: err.message || 'Invalid Input' });
	} else if(err instanceof NotFoundError) {
		console.log(err);
		res.status(err.status).json({ error: err.message || 'Not Found' });
	} else if(err) {
		console.log(err);
		res.status(err.status || 500).json({ error: err.message || 'Server Error' });
	} else {
		res.status(404).json({ error: 'Not Found' });
	}
});

server.listen(port, () => {
	console.log('Server running on port ' + port);
});
