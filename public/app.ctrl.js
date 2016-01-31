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

    			MapsFactory.addMarker(findAirportByIATACode(ctrl.from).latitude, findAirportByIATACode(ctrl.from).longitude, ctrl.from);
                MapsFactory.addMarker(findAirportByIATACode(ctrl.to).latitude, findAirportByIATACode(ctrl.to).longitude, ctrl.to);

                MapsFactory.drawFightPath([
                    {lat: findAirportByIATACode(ctrl.from).latitude, lng: findAirportByIATACode(ctrl.from).longitude},
                    {lat: findAirportByIATACode(ctrl.to).latitude, lng: findAirportByIATACode(ctrl.to).longitude}
                ]);
    		});
    	}

    	var routes, airports;

        FlightSearchFactory.getFlightsInfo().then(function(response) {
            routes = response.data.routes;
            airports = response.data.airports;
            ctrl.airports = response.data.airports;
        });

    	ctrl.search = function() {
    	    ctrl.flightInfo = null;
    	    MapsFactory.clearMap();

    		ctrl.routes = [];

    		var fromRoutes = routes[ctrl.from];
    		var toRoutes = routes[ctrl.to];

    		angular.forEach(fromRoutes, function(fromRoute) {
    			angular.forEach(toRoutes, function(toRoute) {

    				if(fromRoute == toRoute) {
    					FlightSearchFactory.getFlightPriceInfo(ctrl.from, fromRoute, ctrl.date).then(function(response1) {
    						if(!response1.data.flights[0]) {
    							return;
    						}

    						FlightSearchFactory.getFlightPriceInfo(fromRoute, ctrl.to, ctrl.date).then(function(response2) {
    							if(!response2.data.flights[0]) {

    								FlightSearchFactory.getFlightPriceInfo(fromRoute, ctrl.to, new Date(ctrl.date.getFullYear(), ctrl.date.getMonth(), ctrl.date.getDate() + 1)).then(function(response3) {
    									if(!response3.data.flights[0]) {
    										return;
    									}
    									ctrl.routes.push({
    										route: findCityNameByIATACode(ctrl.from) + " --> " + findCityNameByIATACode(fromRoute) + " --> " + findCityNameByIATACode(ctrl.to),
    										date1: $filter('date')(response1.data.flights[0].outbound.dateFrom, 'yyyy-MM-dd HH:mm') + " --> " + $filter('date')(response1.data.flights[0].outbound.dateTo, 'yyyy-MM-dd HH:mm'),
    										price1: response1.data.flights[0].summary.price.value + response1.data.flights[0].summary.price.currencySymbol,
    										date2: $filter('date')(response3.data.flights[0].outbound.dateFrom, 'yyyy-MM-dd HH:mm') + " --> " + $filter('date')(response3.data.flights[0].outbound.dateTo, 'yyyy-MM-dd HH:mm'),
    										price2: response3.data.flights[0].summary.price.value + response3.data.flights[0].summary.price.currencySymbol
    									});

    									MapsFactory.addMarker(findAirportByIATACode(ctrl.from).latitude, findAirportByIATACode(ctrl.from).longitude, ctrl.from);
    									MapsFactory.addMarker(findAirportByIATACode(fromRoute).latitude, findAirportByIATACode(fromRoute).longitude, fromRoute);
    									MapsFactory.addMarker(findAirportByIATACode(ctrl.to).latitude, findAirportByIATACode(ctrl.to).longitude, ctrl.to);

                                        MapsFactory.drawFightPath([
                                            {lat: findAirportByIATACode(ctrl.from).latitude, lng: findAirportByIATACode(ctrl.from).longitude},
                                            {lat: findAirportByIATACode(fromRoute).latitude, lng: findAirportByIATACode(fromRoute).longitude},
                                            {lat: findAirportByIATACode(ctrl.to).latitude, lng: findAirportByIATACode(ctrl.to).longitude}
                                        ]);

    									return;
    								})
    								return;
    							}
    							ctrl.routes.push({
    								route: findCityNameByIATACode(ctrl.from) + " --> " + findCityNameByIATACode(fromRoute) + " --> " + findCityNameByIATACode(ctrl.to),
    								date1: $filter('date')(response1.data.flights[0].outbound.dateFrom, 'yyyy-MM-dd HH:mm') + " --> " + $filter('date')(response1.data.flights[0].outbound.dateTo, 'yyyy-MM-dd HH:mm'),
    								price1: response1.data.flights[0].summary.price.value + response1.data.flights[0].summary.price.currencySymbol,
    								date2: $filter('date')(response2.data.flights[0].outbound.dateFrom, 'yyyy-MM-dd HH:mm') + " --> " + $filter('date')(response2.data.flights[0].outbound.dateTo, 'yyyy-MM-dd HH:mm'),
    								price2: response2.data.flights[0].summary.price.value + response2.data.flights[0].summary.price.currencySymbol
    							});

    							MapsFactory.addMarker(findAirportByIATACode(ctrl.from).latitude, findAirportByIATACode(ctrl.from).longitude, ctrl.from);
                                MapsFactory.addMarker(findAirportByIATACode(fromRoute).latitude, findAirportByIATACode(fromRoute).longitude, fromRoute);
                                MapsFactory.addMarker(findAirportByIATACode(ctrl.to).latitude, findAirportByIATACode(ctrl.to).longitude, ctrl.to);

                                MapsFactory.drawFightPath([
                                    {lat: findAirportByIATACode(ctrl.from).latitude, lng: findAirportByIATACode(ctrl.from).longitude},
                                    {lat: findAirportByIATACode(fromRoute).latitude, lng: findAirportByIATACode(fromRoute).longitude},
                                    {lat: findAirportByIATACode(ctrl.to).latitude, lng: findAirportByIATACode(ctrl.to).longitude}
                                ]);

    						})
    					})

    				}
    			})
    		})
    	}

    	function findCityNameByIATACode(iataCode){
    		for (var i = 0, len = airports.length; i < len; i++) {
    		  if (airports[i].iataCode === iataCode) {
    			return airports[i].name + " (" + airports[i].country.name + ")";
    		  }
    		}

    		return "notFound";

    	}

    	function findAirportByIATACode(iataCode){
    		for (var i = 0, len = airports.length; i < len; i++) {
    		  if (airports[i].iataCode === iataCode) {
    			return airports[i];
    		  }
    		}

    		return "notFound";
    	}
    });
}());



