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

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..', 'client')));

app.listen(port);
console.log('Server running on port ' + port);
