(function () {

    angular.module('flightSearchApp')
      .controller('FlightSearchController', function(FlightSearchFactory, MapsFactory, $filter) {
        var ctrl = this;

    	ctrl.date = new Date(2016, 06, 19);
    	ctrl.minimumHoursBetweenFlights = 2;
    	ctrl.flightInfo;

    	ctrl.fetchInfo = function() {
    	    if(!ctrl.from || !ctrl.to) {
                return;
            }

            ctrl.flightInfo = null;

    	    MapsFactory.clearMap();
            ctrl.routes = [];

    	    FlightSearchFactory.getFlightPriceInfo(ctrl.from.iataCode, ctrl.to.iataCode, ctrl.date).then(function(response) {
    			ctrl.flightInfo = response.data;

    			MapsFactory.addMarker(ctrl.from.coordinates.latitude, ctrl.from.coordinates.longitude, ctrl.from.name);
                MapsFactory.addMarker(ctrl.to.coordinates.latitude, ctrl.to.coordinates.longitude, ctrl.to.name);

                MapsFactory.drawFlightPath([
                    {lat: ctrl.from.coordinates.latitude, lng: ctrl.from.coordinates.longitude},
                    {lat: ctrl.to.coordinates.latitude, lng: ctrl.to.coordinates.longitude}
                ]);
    		});
    	}

    	var airports;

        FlightSearchFactory.getFlightsInfo().then(function(response) {

            airports = response.data.airports;

            ctrl.airports = response.data.airports;

            ctrl.from = findAirportByIATACode('VNO');
            ctrl.to = findAirportByIATACode('BGY');
        });

    	ctrl.search = function() {
    	    if(!ctrl.from || !ctrl.to) {
    	        return;
    	    }

    	    ctrl.flightInfo = null;
    	    MapsFactory.clearMap();

    		ctrl.routes = [];

    		var fromRoutes = ctrl.from.routes;
    		var toRoutes = ctrl.to.routes;

    		var connectedRoutes = [];

            angular.forEach(fromRoutes, function(fromRoute) {
    			angular.forEach(toRoutes, function(toRoute) {
    			    if(fromRoute === toRoute && fromRoute.indexOf('airport:') !== -1) {
    			        connectedRoutes.push(fromRoute.substring('airport:'.length));
    			    }
    			})
            })

            angular.forEach(connectedRoutes, function(route) {

                FlightSearchFactory.getFlightPriceInfo(ctrl.from.iataCode, route, ctrl.date).then(function(response1) {
                    if(!response1.data.fares[0]) {
                        return;
                    }

                    FlightSearchFactory.getFlightPriceInfo(route, ctrl.to.iataCode, ctrl.date).then(function(response2) {
                        if(response2.data.fares[0] && isEnoughTimeBetweenFlights(
                           new Date(response1.data.fares[0].outbound.arrivalDate),
                           new Date(response2.data.fares[0].outbound.departureDate)
                           )) {

                            addToResultRoutes(route, response1, response2);
                            return;
                        }

                        FlightSearchFactory.getFlightPriceInfo(route, ctrl.to.iataCode, new Date(ctrl.date.getFullYear(), ctrl.date.getMonth(), ctrl.date.getDate() + 1)).then(function(response3) {
                            if(response3.data.fares[0] && isEnoughTimeBetweenFlights(
                               new Date(response1.data.fares[0].outbound.arrivalDate),
                               new Date(response3.data.fares[0].outbound.departureDate)
                               )) {

                                addToResultRoutes(route, response1, response3);
                                return;
                            }
                        })
                        return;
                    })
                })
            })
    	}

    	function addToResultRoutes(route, response1, response2) {

            ctrl.routes.push({
                route: ctrl.from.name + " --> " + findCityNameByIATACode(route) + " --> " + ctrl.to.name,
                date1: formatDate(response1.data.fares[0].outbound.departureDate) + " --> " + formatDate(response1.data.fares[0].outbound.arrivalDate),
                price1: response1.data.fares[0].summary.price.value + response1.data.fares[0].summary.price.currencySymbol,
                date2: formatDate(response2.data.fares[0].outbound.departureDate) + " --> " + formatDate(response2.data.fares[0].outbound.arrivalDate),
                price2: response2.data.fares[0].summary.price.value + response2.data.fares[0].summary.price.currencySymbol
            });

            MapsFactory.addMarker(ctrl.from.coordinates.latitude, ctrl.from.coordinates.longitude, ctrl.from.name);
            MapsFactory.addMarker(findAirportByIATACode(route).coordinates.latitude, findAirportByIATACode(route).coordinates.longitude, findCityNameByIATACode(route));
            MapsFactory.addMarker(ctrl.to.coordinates.latitude, ctrl.to.coordinates.longitude, ctrl.to.name);

            MapsFactory.drawFlightPath([
                {lat: ctrl.from.coordinates.latitude, lng: ctrl.from.coordinates.longitude},
                {lat: findAirportByIATACode(route).coordinates.latitude, lng: findAirportByIATACode(route).coordinates.longitude},
                {lat: ctrl.to.coordinates.latitude, lng: ctrl.to.coordinates.longitude}
            ]);

            return;
        }

    	function findCityNameByIATACode(iataCode){
    		return findAirportByIATACode(iataCode).name;
    	}

    	function findAirportByIATACode(iataCode){
    		for (var i = 0, len = airports.length; i < len; i++) {
    		  if (airports[i].iataCode === iataCode) {
    			return airports[i];
    		  }
    		}

    		return "notFound";
    	}

    	function formatDate(date) {
    	    return $filter('date')(date, 'yyyy-MM-dd HH:mm')
    	}

    	function isEnoughTimeBetweenFlights(arrivalDate, departureDate) {
    	    return departureDate - arrivalDate > ctrl.minimumHoursBetweenFlights * 3600000; //hours to miliseconds
    	}
    });
}());



