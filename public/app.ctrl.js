(function () {

    angular.module('flightSearchApp')
      .controller('FlightSearchController', function(FlightSearchFactory, MapsFactory, $filter) {
        var ctrl = this;

    	ctrl.from = 'VNO';
    	ctrl.to = 'BGY';
    	ctrl.date = new Date(2016, 06, 19);
    	ctrl.flightInfo;

    	ctrl.fetchInfo = function() {
    	    MapsFactory.clearMap();
            ctrl.routes = [];

    	    FlightSearchFactory.getFlightPriceInfo(ctrl.from, ctrl.to, ctrl.date).then(function(response) {
    			ctrl.flightInfo = response.data;

    			MapsFactory.addMarker(findAirportByIATACode(ctrl.from).coordinates.latitude, findAirportByIATACode(ctrl.from).coordinates.longitude, findCityNameByIATACode(ctrl.from));
                MapsFactory.addMarker(findAirportByIATACode(ctrl.to).coordinates.latitude, findAirportByIATACode(ctrl.to).coordinates.longitude, findCityNameByIATACode(ctrl.to));

                MapsFactory.drawFlightPath([
                    {lat: findAirportByIATACode(ctrl.from).coordinates.latitude, lng: findAirportByIATACode(ctrl.from).coordinates.longitude},
                    {lat: findAirportByIATACode(ctrl.to).coordinates.latitude, lng: findAirportByIATACode(ctrl.to).coordinates.longitude}
                ]);
    		});
    	}

    	var airports;

        FlightSearchFactory.getFlightsInfo().then(function(response) {

            airports = response.data.airports;

            ctrl.airports = response.data.airports;
        });

    	ctrl.search = function() {
    	    ctrl.flightInfo = null;
    	    MapsFactory.clearMap();

    		ctrl.routes = [];

    		var fromRoutes = findAirportByIATACode(ctrl.from).routes;
    		var toRoutes = findAirportByIATACode(ctrl.to).routes;

    		var connectedRoutes = [];

            angular.forEach(fromRoutes, function(fromRoute) {
    			angular.forEach(toRoutes, function(toRoute) {
    			    if(fromRoute === toRoute && fromRoute.indexOf('airport:') !== -1) {
    			        connectedRoutes.push(fromRoute.substring('airport:'.length));
    			    }
    			})
            })

            angular.forEach(connectedRoutes, function(route) {

                FlightSearchFactory.getFlightPriceInfo(ctrl.from, route, ctrl.date).then(function(response1) {
                    if(!response1.data.fares[0]) {
                        return;
                    }

                    FlightSearchFactory.getFlightPriceInfo(route, ctrl.to, ctrl.date).then(function(response2) {
                        if(response2.data.fares[0]) {
                            addToResultRoutes(route, response1, response2);
                            return;
                        }

                        FlightSearchFactory.getFlightPriceInfo(route, ctrl.to, new Date(ctrl.date.getFullYear(), ctrl.date.getMonth(), ctrl.date.getDate() + 1)).then(function(response3) {
                            if(!response3.data.fares[0]) {
                                return;
                            }

                            addToResultRoutes(route, response1, response3);
                        })
                        return;
                    })
                })
            })
    	}

    	function addToResultRoutes(route, response1, response2) {

            ctrl.routes.push({
                route: findCityNameByIATACode(ctrl.from) + " --> " + findCityNameByIATACode(route) + " --> " + findCityNameByIATACode(ctrl.to),
                date1: formatDate(response1.data.fares[0].outbound.departureDate) + " --> " + formatDate(response1.data.fares[0].outbound.arrivalDate),
                price1: response1.data.fares[0].summary.price.value + response1.data.fares[0].summary.price.currencySymbol,
                date2: formatDate(response2.data.fares[0].outbound.departureDate) + " --> " + formatDate(response2.data.fares[0].outbound.arrivalDate),
                price2: response2.data.fares[0].summary.price.value + response2.data.fares[0].summary.price.currencySymbol
            });

            MapsFactory.addMarker(findAirportByIATACode(ctrl.from).coordinates.latitude, findAirportByIATACode(ctrl.from).coordinates.longitude, findCityNameByIATACode(ctrl.from));
            MapsFactory.addMarker(findAirportByIATACode(route).coordinates.latitude, findAirportByIATACode(route).coordinates.longitude, findCityNameByIATACode(route));
            MapsFactory.addMarker(findAirportByIATACode(ctrl.to).coordinates.latitude, findAirportByIATACode(ctrl.to).coordinates.longitude, findCityNameByIATACode(ctrl.to));

            MapsFactory.drawFlightPath([
                {lat: findAirportByIATACode(ctrl.from).coordinates.latitude, lng: findAirportByIATACode(ctrl.from).coordinates.longitude},
                {lat: findAirportByIATACode(route).coordinates.latitude, lng: findAirportByIATACode(route).coordinates.longitude},
                {lat: findAirportByIATACode(ctrl.to).coordinates.latitude, lng: findAirportByIATACode(ctrl.to).coordinates.longitude}
            ]);

            return;
        }

    	function findCityNameByIATACode(iataCode){
    		return findAirportByIATACode().name;
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
    	    return $filter('date')(date, 'yyyy-MM-dd HH:mm', 'UTC')
    	}
    });
}());



