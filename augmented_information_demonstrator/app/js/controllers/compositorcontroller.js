/**
 * Created by Moises Vilar on 23/10/2014.
 */

angular.module('app').controller('compositorcontroller', [
    '$scope',
    '$timeout',
    '$compile',
    'SubtitlesGeodata',
    'Nominatim',
    'Geodata',
    'Timer',
    function($scope, $timeout, $compile, SubtitlesGeodata, Nominatim, Geodata, Timer) {

        var MARK_AS_COMPLETED_STRING = 'Completado';
        var MARK_AS_PARTIALLY_STRING = 'No completado';
        var MAPQUEST_KEY = 'Fmjtd%7Cluurnua72d%2C72%3Do5-9w8xlw';
        var POIS_MAPQUEST_TEMPLATE = '{index},{lat},{lon}|';
        var STATIC_MAP_REQUEST_TEMPLATE = 'http://www.mapquestapi.com/staticmap/v4/getmap?key={key}&size=600,300&zoom={zoom}&center={lat},{lon}&pois={pois}';
            //'http://maps.googleapis.com/maps/api/staticmap?center={lat},{lon}&zoom={zoom}&size=600x300';
            //'http://ojw.dev.openstreetmap.org/StaticMap/?lat={lat}&lon={lon}&z={zoom}&show=1';
        var PLAY = 'Reproducir';
        var STOP = 'Detener';
        var LAT = 40.095;
        var LON = -3.823;
        var CONTENT = '';

        var map = undefined;
        var geodata = undefined;
        var startIndex = -1;
        var timer = new Timer();
        var id = 0;
        var popups = [];

        $scope.speed = 1;
        $scope.selectedNew = undefined;
        $scope.queryString = undefined;
        $scope.subtitleIndex = 0;
        $scope.totalSubtitles = 0;
        $scope.currentSubtitle = {};
        $scope.subtitles = [];
        $scope.results = [];
        $scope.geodataCaptured = false;
        $scope.currentSecond = 0;
        $scope.markers = {};
        $scope.playing = false;

        initScope();
        initMap();

        $scope.onNewClick = function (_new) {
            initScope();
            initVariables();
            $scope.selectedNew = _new;
            initMap();
            var id = _new._id.split('/').join('_').split(':').join('_');
            SubtitlesGeodata.get({id: id}, function (data) {
                $scope.subtitles = data.subtitles;
                $scope.currentSubtitle = $scope.subtitles[0];
                $scope.totalSubtitles = $scope.subtitles.length;
                updateMap();
            });
        };

        $scope.markAsCompleted = function () {
            if ($scope.selectedNew.state == 2) SubtitlesGeodata.updateState($scope.selectedNew._id, 1).success(function () {
                $scope.selectedNew.state = 1;
            });
            else SubtitlesGeodata.updateState($scope.selectedNew._id, 2).then(function () {
                $scope.selectedNew.state = 2;
            });
        };

        $scope.start = function () {
            $scope.results = [];
            geodata = getMapData();
            startIndex = $scope.subtitleIndex;
            $scope.geodataCaptured = true;
        };

        $scope.end = function () {
            $scope.results = [];
            var count = 0;
            var total = $scope.subtitleIndex - startIndex + 1;
            for (var i = startIndex; i <= $scope.subtitleIndex; i++) {
                (function (i) {
                    return SubtitlesGeodata.updateGeodata($scope.selectedNew._id, $scope.subtitles[i].ns, geodata, i).success(function () {
                        $scope.subtitles[i].geodata = geodata;
                        count++;
                        if (count >= total) {
                            $scope.geodataCaptured = false;
                        }
                    });
                })(i);
            }
        };

        $scope.unassign = function (subtitle) {
            subtitle = subtitle || $scope.currentSubtitle;
            SubtitlesGeodata.updateGeodata($scope.selectedNew._id, subtitle.ns, {}).success(function () {
                subtitle.geodata = {};
            });
        };

        $scope.search = function (queryString) {
            queryString = queryString || $scope.queryString || '';
            Nominatim.search(queryString).then(function (results) {
                $scope.results = results;
            });
        };

        $scope.centerMap = function (result) {
            var lat = result.lat;
            var lon = result.lon;
            var zoom = map.getBoundsZoom([
                [result.boundingbox[0], result.boundingbox[2]],
                [result.boundingbox[1], result.boundingbox[3]]
            ]);
            map.setView([lat, lon], zoom);
        };

        $scope.allocateSubtitle = function (subtitle) {
            subtitle = subtitle || $scope.currentSubtitle;
            $scope.currentSubtitle = subtitle;
            $scope.subtitleIndex = $scope.subtitles.indexOf(subtitle);
            updateMap(subtitle);
        };

        $scope.getStaticMap = function (subtitle) {
            subtitle = subtitle || $scope.currentSubtitle;
            if (!hasGeodata(subtitle.geodata)) return '';
            var bounds = L.latLngBounds(subtitle.geodata.boundingbox);
            var center = bounds.getCenter();
            var zoom = map.getBoundsZoom(bounds);
            var pois = '';
            if (subtitle.geodata.markers) {
                subtitle.geodata.markers.forEach(function(marker, index) {
                    pois += POIS_MAPQUEST_TEMPLATE
                        .replace('{index}', index + 1)
                        .replace('{lat}', marker.point.lat)
                        .replace('{lon}', marker.point.lon);
                });
            }
            var result = STATIC_MAP_REQUEST_TEMPLATE
                .replace('{key}', MAPQUEST_KEY)
                .replace('{lat}', center.lat)
                .replace('{lon}', center.lng)
                .replace('{zoom}', zoom)
                .replace('{pois}', pois);
            return result;
        };

        $scope.hasGeodata = function (subtitle) {
            subtitle = subtitle || $scope.currentSubtitle;
            if (!subtitle) return false;
            return hasGeodata(subtitle.geodata);
        };

        $scope.previous = function () {
            if ($scope.subtitleIndex > 0) {
                $scope.subtitleIndex--;
                updateCurrentSubtitle();
            }
        };

        $scope.next = function () {
            if ($scope.subtitleIndex < $scope.totalSubtitles-1) {
                $scope.subtitleIndex++;
                updateCurrentSubtitle();
            }
        };

        $scope.isCompletedToString = function () {
            if (!$scope.selectedNew) return;
            if ($scope.selectedNew.state == 2) return MARK_AS_PARTIALLY_STRING;
            else return MARK_AS_COMPLETED_STRING;
        };

        $scope.pauseOrPlayToString = function () {
            return !$scope.playing ? PLAY : STOP;
        };

        $scope.pauseOrPlay = function () {
            if ($scope.playing) {
                $scope.playing = false;
                removePopups();
                timer.stop();
            }
            else {
                $scope.playing = true;
                if ($scope.subtitleIndex == 0) {
                    $scope.currentSecond = 0;
                    $scope.currentSubtitle = undefined;
                    initMap();
                }
                else {
                    $scope.currentSecond = idToSecond($scope.subtitles[$scope.subtitleIndex].ns);
                }
                timer.start(0, calculatePeriodFromSpeed(), processSubtitle);
            }
        };

        $scope.$watch('speed', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            if ($scope.playing) {
                timer.start(0, calculatePeriodFromSpeed(newValue), processSubtitle);
            }
        });

        $scope.addMarker = function(content, lat, lon) {
            lat = lat || map.getCenter().lat || LAT;
            lon = lon || map.getCenter().lng || LON;
            content = content || CONTENT;
            (function(lat, lon, content) {
                var marker = L.marker(
                    [lat, lon],{
                        draggable: true,
                        riseOnHover: true
                    });
                marker.id = id++;
                marker.content = content;
                marker.on('dblclick', function() {
                    map.removeLayer(marker);
                    delete  $scope.markers[marker.id];
                });
                $scope.markers[marker.id] = marker;
                var form = '<input type="text" ng-model="marker.content">';
                var linkFunction = $compile(angular.element(form));
                var newScope = $scope.$new();
                newScope.marker = marker;
                marker.bindPopup(linkFunction(newScope)[0], {
                    className: 'popup'
                });
                marker.openPopup();
                map.addLayer(marker);
            })(lat, lon, content);
        };

        $scope.deleteMarker = function(marker) {
            var id = marker.id;
            map.removeLayer($scope.markers[id]);
            delete $scope.markers[id];
        };

        function initScope() {
            $scope.speed = 1;
            $scope.selectedNew = undefined;
            $scope.queryString = undefined;
            $scope.subtitleIndex = 0;
            $scope.totalSubtitles = 0;
            $scope.currentSubtitle = {};
            $scope.subtitles = [];
            $scope.results = [];
            $scope.geodataCaptured = false;
            $scope.currentSecond = 0;
            $scope.markers = {};
            $scope.playing = false;
        }

        function initVariables() {
            geodata = undefined;
            startIndex = -1;
            timer.stop();
            id = 0;
            popups = [];
        }

        function processSubtitle() {
            if (!$scope.subtitles[$scope.subtitleIndex]) return;
            $scope.currentSecond++;
            var subtitleSecond = idToSecond($scope.subtitles[$scope.subtitleIndex].ns);
            if (subtitleSecond <= $scope.currentSecond) {
                $scope.currentSubtitle = $scope.subtitles[$scope.subtitleIndex];
                updateMap($scope.currentSubtitle);
                $scope.subtitleIndex++;
            }
            if ($scope.subtitleIndex >= $scope.subtitles.length) {
                timer.stop();
            }
        }

        function idToSecond(id) {
            var elem0 = id.toString().split('_')[0];
            var elem1 = id.toString().split('_')[1];
            if (elem1) return parseInt(elem1);
            else return parseInt(elem0);
        }

        function calculatePeriodFromSpeed(value) {
            value = value || $scope.speed;
            switch (value) {
                case '1':
                    return 1000;
                case '2':
                    return 500;
                case '3':
                    return 300;
                default:
                    return 1000;
            }
        }

        function updateCurrentSubtitle() {
            $scope.currentSubtitle = $scope.subtitles[$scope.subtitleIndex];
            updateMap();
        }

        function initMap() {
            if (map) map.remove();
            map = L.map('map', {
                layers: MQ.mapLayer(),
                center: [LAT, LON],
                zoom: 4
            });
            L.Util.requestAnimFrame(map.invalidateSize, map, false, map._container);
        }

        function updateMap(subtitle) {
            subtitle = subtitle || $scope.currentSubtitle;
            if (!subtitle) return;
            if (!hasGeodata(subtitle.geodata)) return;
            if (!$scope.geodataCaptured && !$scope.playing) removeMarkers(subtitle);
            var bounds = L.latLngBounds(subtitle.geodata.boundingbox);
            var center = bounds.getCenter();
            var zoom = map.getBoundsZoom(bounds);
            map.setView(center, zoom);
            if ($scope.playing) showPopups(subtitle.geodata);
        }

        function removeMarkers(subtitle) {
            for (var id in $scope.markers) {
                map.removeLayer($scope.markers[id]);
                delete $scope.markers[id];
            }
            subtitle = subtitle || $scope.currentSubtitle;
            if (!subtitle.geodata || !subtitle.geodata.markers) return;
            subtitle.geodata.markers.forEach(function(marker) {
                $scope.addMarker(marker.text, marker.point.lat, marker.point.lon);
            });
        }

        function showPopups(geodata) {
            removePopups();
            if (!geodata.markers) return;
            geodata.markers.forEach(function(marker) {
                var popup = L.popup({closeButton: false, closeOnClick: false})
                    .setLatLng([marker.point.lat, marker.point.lon])
                    .setContent(marker.text)
                    .addTo(map);
                popups.push(popup);
            });
        }

        function removePopups() {
            popups.forEach(function(popup) {
                map.closePopup(popup);
            });
            popups = [];
        }

        function getMapData() {
            var markers = $.map($scope.markers, function (value) {
                return value;
            }).map(function (marker) {
                return {
                    text: marker.content,
                    point: {
                        lat: marker.getLatLng().lat,
                        lon: marker.getLatLng().lng
                    }
                }
            });
            var boundingbox = [
                [map.getBounds().getSouthWest().lat, map.getBounds().getSouthWest().lng],
                [map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng]
            ];
            return new Geodata({
                boundingbox: boundingbox,
                markers: markers
            });
        }

        function hasGeodata(geodata) {
            if(!geodata) return false;
            else if (!geodata.boundingbox) return false;
            else if (geodata.boundingbox.length == 0) return false;
            else if (geodata.boundingbox == [[],[]]) return false;
            return true;
        }

    }
]);