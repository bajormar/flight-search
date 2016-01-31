(function () {

    angular
    .module('flightSearchApp')
    .factory('FlightSearchFactory', function($http, $filter) {

        function getFlightPriceInfo(from, to, date){
            return $http.get('/api/flights/from/' + from + '/to/' + to + '/date/' + $filter('date')(date, 'yyyy-MM-dd'));
        }

        function getFlightsInfo(from, to, date){
            return $http.get('/api/flightsInfo');
        }

        return {
            getFlightPriceInfo: getFlightPriceInfo,
            getFlightsInfo: getFlightsInfo
        }
    });
}());



