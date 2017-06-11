const express = require('express');
const app = express();
const server = require('http').createServer(app);
require('./lib/sockets').init(server);
const bodyParser = require('body-parser');
const path = require('path');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;

const router = express.Router();

require('./api/parents').init(router);
require('./api/lights').init(router);
require('./api/schedule').init(router);
require('./api/errors').init(router);

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..', 'client')));

require('./errors').init(app);

server.listen(port, () => {
	console.log('Server running on port ' + port);
});
