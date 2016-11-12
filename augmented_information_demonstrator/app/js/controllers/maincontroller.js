/**
 * Created by Moises Vilar on 15/10/2014.
 */

angular.module('app').controller('maincontroller', [
    '$scope',
    '$timeout',
    'Subtitles',
    'Urls',
    'New',
    'Timer',
    'AugmentedInformation',
    function ($scope, $timeout, Subtitles, Urls, New, Timer, AugmentedInformation) {

        var PROCESS_ALL = 'Procesar todo';
        var PROCESSING = 'Procesando...';
        var PROCESSING_SUBTITLES = 'Procesados {n} subtítulos de {t} en total';

        var subtitles = [];
        var index = 0;
        var timer = new Timer();
        var aiService = new AugmentedInformation();
        var map = undefined;
        var popup = null;
        var bboxPolygon = null;
        var wkbboxPolygon = null;
        var paused = false;
        var processing = false;
        var all_processed = false;

        $scope.speed = 1;
        $scope.clustering = 1;
        $scope.selectedNew = undefined;
        $scope.currentSubtitle = undefined;
        $scope.currentSecond = 0;
        $scope.geodata = [];
        $scope.geocoding = 'geonames';
        $scope.terms_extractor = 'adega';
        $scope.getBoundingBox = 'perimeter';
        $scope.processLabel = PROCESS_ALL;
        $scope.processingStr = '';

        initMap();

        $scope.isProcessing = function () {
            return processing;
        };

        $scope.pauseOrPlay = function () {
            if (paused) {
                paused = false;
                timer.start(0, calculatePeriodFromSpeed(), processSubtitle);
            }
            else {
                paused = true;
                timer.stop();
            }
        };

        $scope.pauseOrPlayToString = function () {
            return paused ? "Reanudar" : "Pausar";
        };

        $scope.processAll = function () {
            processing = true;
            paused = true;
            timer.stop();
            $scope.geodata = [];
            resetMap();
            $scope.processLabel = PROCESSING;
            $scope.processingStr = PROCESSING_SUBTITLES.replace('{n}', '0').replace('{t}', subtitles.length);
            var count = 0;
            $timeout(function () {
                subtitles.forEach(function (subtitle) {
                    var options = {
                        terms_extractor: $scope.terms_extractor,
                        geocoding: $scope.geocoding,
                        getBoundingBox: {
                            type: $scope.getBoundingBox,
                            dimensions: {
                                w: map.getSize().x,
                                h: map.getSize().y
                            }
                        }
                    };
                    aiService.search(subtitle, options).success(function (data) {
                        count++;
                        $scope.processingStr = PROCESSING_SUBTITLES.replace('{n}', count).replace('{t}', subtitles.length);
                        if (count == subtitles.length) {
                            $scope.processLabel = PROCESS_ALL;
                            processing = false;
                            all_processed = true;
                            return;
                        }
                        if (!data) return;
                        data.forEach(function (item) {
                            displayGeodataFromObject(item);
                        });
                    });
                });
            }, 1000);
        };

        $scope.onNewClick = function (_new) {
            timer.stop();
            initScope(_new);
            resetMap();
            Subtitles.get(buildSubtitleFileName(_new.url)).success(function (data) {
                subtitles = data.subtitles;
                processSubtitle();
                timer.start(0, calculatePeriodFromSpeed(), processSubtitle);
            });
        };

        $scope.updateMap = function(item) {
            displayGeodataFromObject(item, true);
        };

        $scope.$watch('speed', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            timer.start(0, calculatePeriodFromSpeed(newValue), processSubtitle);
        });

        $scope.$watch('clustering', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            checkClustering(newValue);
            aiService.setClustering($scope.clustering);
        });

        $scope.$watch('terms_extractor', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            aiService.setTermsExtractor($scope.terms_extractor);
        });

        $scope.$watch('geocoding', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            aiService.setGeocoding($scope.geocoding);
        });

        $scope.$watch('getBoundingBox', function(newValue, oldValue) {
            if (newValue == oldValue) return;
            var getBoundingBox = {
                type: $scope.getBoundingBox,
                dimensions: {
                    w: map.getSize().x,
                    h: map.getSize().y
                }
            };
            aiService.setGetBoundingBox(getBoundingBox);
        });

        function initMap() {
            if (!map) map = L.map('map');
            map.setView([40.095, -3.823], 4);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        function resetMap() {
            map.setView([40.095, -3.823], 4);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            if (popup) map.closePopup(popup);
            if (bboxPolygon) map.removeLayer(bboxPolygon);
            if (wkbboxPolygon) map.removeLayer(wkbboxPolygon);
        }

        function initScope(_new) {
            $scope.geodata = [];
            $scope.selectedNew = _new;
            $scope.currentSubtitle = undefined;
            $scope.currentSecond = -1;
            $scope.processingStr = '';
            index = 0;
            all_processed = false;
            var getBoundingBox = {
                type: $scope.getBoundingBox,
                dimensions: {
                    w: map.getSize().x,
                    h: map.getSize().y
                }
            };
            aiService.start($scope.clustering, $scope.terms_extractor, $scope.geocoding, getBoundingBox, displayGeodataFromArray);
            paused = false;
            processing = false;
        }

        function buildSubtitleFileName(url) {
            return url.split('/').join('_').split(':').join('_') + '.json';
        }

        function processSubtitle() {
            if (!subtitles[index]) return;
            $scope.currentSecond++;
            var subtitleSecond = idToSecond(subtitles[index].ns);
            if (subtitleSecond <= $scope.currentSecond) {
                $scope.currentSubtitle = subtitles[index];
                index++;
                var getBoundingBox = {
                    type: $scope.getBoundingBox,
                    dimensions: {
                        w: map.getSize().x,
                        h: map.getSize().y
                    }
                };
                aiService.add($scope.currentSubtitle, getBoundingBox);
            }
            if (index >= subtitles.length) {
                timer.stop();
            }
        }

        function displayGeodataFromObject(item, ignore) {
            if (item.geodata && item.geodata.length > 0) {
                if (!ignore) {
                    $scope.geodata.push({
                        sec: idToSecond(item.ns),
                        term: item.label,
                        text: item.text,
                        name: item.geodata[0].name,
                        country: item.geodata[0].country,
                        admin: item.geodata[0].admin,
                        lat: item.geodata[0].lat,
                        lon: item.geodata[0].lon,
                        geodata: item.geodata
                    });
                }
                var bbox = item.geodata[0].bbox;
                var wkbbox = item.geodata[0].wkregion.bbox;
                var bboxBounds = L.latLngBounds(bbox);
                /*
                var zoom = map.getBoundsZoom(bboxBounds);
                var center = bboxBounds.getCenter();
                map.setView(center, zoom, {animate: true});
                */
                map.fitBounds(bboxBounds);
                if (popup) map.closePopup(popup);
                popup = L.popup({closeButton: false, closeOnClick: false})
                    .setLatLng([item.geodata[0].lat, item.geodata[0].lon])
                    .setContent(item.label?item.label:item.term)
                    .addTo(map);
                if (bboxPolygon) map.removeLayer(bboxPolygon);
                bboxPolygon = L.polygon(bbox, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.1
                })
                    .bindPopup(item.geodata[0].wkregion.name)
                    .addTo(map);
                if (wkbboxPolygon) map.removeLayer(wkbboxPolygon);
                wkbboxPolygon = L.polygon(wkbbox, {
                    color: '00CC00',
                    fillColor: '#B2FF66',
                    fillOpacity: 0.4
                })
                    .bindPopup(item.geodata[0].wkregion.name)
                    .addTo(map);
            }
        }

        function displayGeodataFromArray(data) {
            if (!data || data.length == 0) return;
            data.forEach(function (item) {
                displayGeodataFromObject(item);
            });
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

        function idToSecond(id) {
            var elem0 = id.toString().split('_')[0];
            var elem1 = id.toString().split('_')[1];
            if (elem1) return parseInt(elem1);
            else return parseInt(elem0);
        }

        function checkClustering(value) {
            if (value < 1) $scope.clustering = 1;
            else if (value > subtitles.length) $scope.clustering = subtitles.length;
        }
    }]);