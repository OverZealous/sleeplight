const express = require('express');        // call express
const app = express();                 // define our app using express
const bodyParser = require('body-parser');
const path = require('path');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;

const router = express.Router();

require('./api/lights').init(router);
require('./api/timers').init(router);

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..', 'client')));

app.listen(port);
console.log('Server running on port ' + port);
