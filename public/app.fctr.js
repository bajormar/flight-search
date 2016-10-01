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

        function getFlightPriceInfoSkyScanner(from, to, date){
            return $http.get('/api/flightsv2/from/' + from + '/to/' + to + '/date/' + $filter('date')(date, 'yyyy-MM-dd'));
        }

        return {
            getFlightPriceInfoSkyScanner: getFlightPriceInfoSkyScanner,
            getFlightPriceInfo: getFlightPriceInfo,
            getFlightsInfo: getFlightsInfo
        }
    });
}());



