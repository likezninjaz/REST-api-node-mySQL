//Parse data from JSON POST and insert into MYSQL

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

// Configure MySQL connection
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Bilet2017',
	database: 'jobseekers'
 });

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;        // set our port

//Establish MySQL connection
connection.connect(function(err) {
   if (err) 
      throw err
   else {
       console.log('Connected to MySQL');
       // Start the app when connection is ready
       app.listen(port);
       app.use('/api', router);
       console.log('Server listening on port ' + port);
    }
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/profiles', function(req, res) {
	connection.query("SELECT * FROM profiles", function (err, result, fields) {
	    if (err) throw err;
	    res.json(result);
	});
});

router.get('/profiles/:profile_id', function(req, res) {
	var sql = 'SELECT * FROM profiles WHERE profile_id = ?';
	var profile_id = [req.params.profile_id];
	connection.query(sql, profile_id, function (err, result, fields) {
	    if (err) throw err;
	    console.log(res);
	    res.json(result);
	});
});
