(function () {

    angular
    .module('flightSearchApp')
    .factory('MapsFactory', function($http, $filter) {

        var map;
        var markers = [];
        var paths = [];

        function initialize() {
            var mapProp = {
                center: new google.maps.LatLng(51.508742,-0.120850),
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
        }

        google.maps.event.addDomListener(window, 'load', initialize);

        function getMap() {
            return map;
        }

        function addMarker(latitude, longitude, title) {
            var marker = new google.maps.Marker({
                position: {lat: latitude, lng: longitude},
                map: map,
                title: title
            });

            markers.push(marker)
        }

        function drawFightPath(path) {
            var path = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: getRandomColor(),
                strokeOpacity: 1.0,
                map: map,
                strokeWeight: 2
            });

            paths.push(path);
        }

        function getRandomColor() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function clearMap() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }

            markers = [];

            for (var i = 0; i < paths.length; i++) {
                paths[i].setMap(null);
            }

            paths = [];
        }

        return {
            getMap: getMap,
            addMarker: addMarker,
            drawFightPath: drawFightPath,
            clearMap: clearMap
        }
    });
}());



