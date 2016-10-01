// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var cheerio = require('cheerio');

    // configuration =================

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
	
	app.get('/api/flights/from/:from/to/:to/date/:date', function(req, res) {
        var request = require('request');
        request('https://api.ryanair.com/farefinder/3/oneWayFares?&departureAirportIataCode=' + req.params.from + '&arrivalAirportIataCode=' + req.params.to + '&language=lt&limit=5&offset=0&outboundDepartureDateFrom=' + req.params.date + '&outboundDepartureDateTo=' + req.params.date, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
             }
        })
    });


	app.get('/api/flightsInfo', function(req, res) {
        var request = require('request');
		request('https://api.ryanair.com/aggregate/3/common?embedded=airports&market=lt-lt', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				res.send(body);
			 }
		})
    });

    app.get('/api/flightsv2/from/:from/to/:to/date/:date', function(req, res) {
        var request = require('request');

        var options = {
            url: 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            form: {
                country:'LT',
                currency:'EUR',
                locale:'en-GB',
                apikey:'ba468542315747896697793974776053',
                grouppricing:true,
                locationSchema:'Iata',
                originplace: req.params.from,
                destinationplace: req.params.to,
                outbounddate: req.params.date,
                adults:1,
                children:0,
                infants:0
            }
        };

        request(options, function (error, response, body) {
            request(response.headers.location + '?apiKey=ba468542315747896697793974776053', function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.send(body);
                }
            })
        });
    });


	app.get('*', function(req, res) {
        res.sendfile('public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
	
	app.set('port', (process.env.PORT || 8080));


	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});
	
	