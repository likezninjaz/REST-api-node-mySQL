//Parse data from JSON POST and insert into MYSQL

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var allowCrossDomain = require('./headers/cross-domain');

// Configure MySQL connection
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'oromaka',
	database: 'jobseekers'
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCrossDomain);


var port = process.env.PORT || 8080;        // set our port

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

function search(query) {
  return function(element) {
    for(var i in query) {
      if(query[i] != element[i]) {
        return false;
      }
    }
    return true;
  }
}

exports.search = function(query) {
  return users.filter(search(query));
}

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/profiles', function(req, res) {
	var town = req.param('town'),
  	    schedule = req.param('employment'),
  	    grade = req.param('grade');
  var query = "SELECT * FROM profiles"; //TO DO: IMPROVE THIS LOGIC!
  if (town || schedule || grade) {
  	query += " WHERE id >= 0"
  };
  if (town) {
  	query += " AND town = ?";
	};
	if (schedule) {
  		query += " AND schedule = ?";
	};
	if (grade) {
  		query += " AND grade = ?";
	};
  connection.query(query, [town, schedule, grade], function (err, result, fields) {
		if (err) throw err;
		result = result.map(function(row) {
	    	return Object.assign({}, row, {
	    		name: row.first_name + " " + row.surname,
	    		specialization: row.grade
	    	});
	    });
	    res.json(result);
		console.log(new Date(), query);
		//console.log(res);
	});
});

router.get('/meetings/:user_id', function(req, res) {
	var sql = 'SELECT * FROM meetings WHERE user_id = ?';
	var user_id = [req.params.user_id];
	connection.query(sql, user_id, function (err, result, fields) {
	    if (err) throw err;
	    result = result.map(function(row) {
	    	return Object.assign({}, row, { from: row.from.toString(), to: row.to.toString() });
	    });
		console.log(result)
	    res.json(result);
	});
});

router.get('/profiles/:profile_id', function(req, res) {
	var mainQuery = 'SELECT * FROM profiles WHERE id = ?';
	var specsQuery = 'SELECT name AS position FROM specializations WHERE id in (SELECT specialization_id FROM profile_specializations WHERE profile_id = ?)';
	var jobHistoryQuery = 'SELECT * FROM jobs WHERE id = ?'
	var skillsQuery = 'SELECT skill FROM skills WHERE id in (SELECT skill_id FROM profile_skills WHERE profile_id = ?)';
	var hobbiesQuery = 'SELECT hobby FROM hobbies WHERE id in (SELECT hobby_id FROM profile_hobbies WHERE profile_id = ?)';
	var profile_id = [req.params.profile_id];
	connection.query(mainQuery, profile_id, function (err, result, fields) {
	    if (err) throw err;
	    var obj1 = result[0];
	    connection.query(specsQuery, profile_id, function (err, result, fields) {
		    if (err) throw err;
		    var obj2 = {specialization: result};
		    connection.query(jobHistoryQuery, profile_id, function (err, result, fields) {
			    if (err) throw err;
			    result = result.map(function(row) {
			    	return Object.assign({}, row, { from: row.start, to: row.end });
			    });
			    var obj3 = {jobHistory: result};
			    connection.query(skillsQuery, profile_id, function (err, result, fields) {
				    if (err) throw err;
				    result = result.map(a => a.skill);
				    var obj4 = {skills: result};
				    connection.query(hobbiesQuery, profile_id, function (err, result, fields) {
					    if (err) throw err;
					    result = result.map(a => a.hobby);
					    var obj5 = {hobby: result};
					    var a = Object.assign(obj1, obj2, obj3, obj4, obj5);
					    console.log(a);
					    res.json(a);
					});
				});
			});
		});
	});

});
