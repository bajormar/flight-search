// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

    // configuration =================

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
	
	app.get('/api/flights/from/:from/to/:to/date/:date', function(req, res) {
        var request = require('request');
		request('https://www.ryanair.com/en/api/2/flights/from/' + req.params.from + '/to/' + req.params.to + '/' + req.params.date + '/' + req.params.date + '/250/unique/?limit=15&offset-0', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				res.send(body);
			 }
		})
    });
	
	app.get('/api/flightsInfo', function(req, res) {
        var request = require('request');
		request('https://www.ryanair.com/en/api/2/forms/flight-booking-selector/', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				res.send(body);
			 }
		})
    });
	
	app.get('*', function(req, res) {
        res.sendfile('public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
	
	app.set('port', (process.env.PORT || 8080));


	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});
	
	