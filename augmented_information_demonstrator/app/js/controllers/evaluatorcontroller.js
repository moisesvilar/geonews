/**
 * Created by Moises Vilar on 17/11/2014.
 */

angular.module('app').controller('evaluatorcontroller', [
    '$scope',
    '$q',
    '$timeout',
    'SubtitlesGeodata',
    'GeometricUtils',
    'Processor',
    function ($scope, $q, $timeout, SubtitlesGeodata, GeometricUtils, Processor) {
        $scope.termsExtractors = [
            'adega',
            'stanford'
        ];
        $scope.geocodingMethods = [
            'geonames',
            'openstreetmaps'
        ];
        $scope.bboxMethods = [
            'perimeter',
            'area',
            'distance_perimeter',
            'distance_area',
            'aspect_perimeter',
            'aspect_area'
        ];
        $scope.chartConfig = {
            labels: false,
            title: "",
            legend: {
                display: true,
                position: 'right'
            },
            lineLegend: 'traditional'
        };
        $scope.chartType = 'line';
        $scope.clustering = 1;
        $scope.alpha = 0.5;
        $scope.started = false;
        $scope.processing = false;
        $scope.validating = false;
        $scope.selectedTermExtractorForResults = '';
        $scope.selectedGeocodingMethodForResults = '';
        $scope.selectedBboxMethodForResults = '';

        $scope.selectedNews = [];
        $scope.processedNews = [];
        $scope.selectedTermsExtractors = [];
        $scope.selectedGeocodingMethods = [];
        $scope.selectedBboxMethods = [];
        $scope.tableData = [];
        $scope.news = [];
        $scope.countSubtitles = -1;
        $scope.totalSubtitles = -1;
        $scope.currentNew = null;

        SubtitlesGeodata.query(function (news) {
            $scope.news = news.filter(function (item) {
                return item.state == 2;
            });
        });

        var map = null;
        var context = null;
        var chart = null;
        var chartOptions = {
            scaleShowGridLines: true,
            scaleGridLineColor: "rgba(0,0,0,.05)",
            scaleGridLineWidth: 1,
            bezierCurve: true,
            bezierCurveTension: 0.4,
            pointDot: true,
            pointDotRadius: 1,
            pointDotStrokeWidth: 1,
            pointHitDetectionRadius: 20,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
        };

        initMap();
        initChart();

        $scope.start = function () {
            if ($scope.selectedNews.length == 0) return;
            if ($scope.selectedTermsExtractors.length == 0) return;
            if ($scope.selectedGeocodingMethods.length == 0) return;
            if ($scope.selectedBboxMethods.length == 0) return;
            $scope.started = true;
            $scope.processing = false;
            $scope.validating = false;
            $scope.finished = false;
            $scope.tableData = [];
            $scope.currentNew = null;
            var chartData = {
                labels: [],
                datasets: [
                    {
                        label: "Fma",
                        pointHighlightStroke: "rgba(255, 153, 153, 1)",
                        fillColor: "rgba(255, 102, 102, 0.2)",
                        strokeColor: "rgba(255, 51, 51, 1)",
                        pointColor: "rgba(204, 0, 0, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        data: []
                    },
                    {
                        label: "Fmg",
                        pointHighlightStroke: "rgba(153, 255, 255, 1)",
                        fillColor: "rgba(102, 255, 255, 0.2)",
                        strokeColor: "rgba(51, 255, 255, 1)",
                        pointColor: "rgba(0, 204, 204, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        data: []
                    }
                ]
            };
            chart.Line(chartData, chartOptions);
            Processor.processVersion1(
                {
                    selectedNews: $scope.selectedNews,
                    processedNews: $scope.processedNews,
                    selectedTermsExtractors: $scope.selectedTermsExtractors,
                    selectedGeocodingMethods: $scope.selectedGeocodingMethods,
                    selectedBboxMethods: $scope.selectedBboxMethods,
                    mapSize: {
                        x: map.getSize().x,
                        y: map.getSize().y
                    },
                    alpha: $scope.alpha
                },
                {
                    beforeProcess: function () {
                        $scope.processing = true;
                        $scope.countSubtitles = 0.0;
                    },
                    updateTotalSubtitles: function(totalSubtitles) {
                        $scope.totalSubtitles = totalSubtitles;
                    },
                    processing: function() {
                        $scope.countSubtitles++;
                    },
                    beforeValidation: function() {
                        $scope.processing = false;
                        $scope.validating = true;
                        $scope.countSubtitles = 0.0;
                    },
                    validating: function() {
                        $scope.countSubtitles++;
                    },
                    finish: function() {
                        $scope.validating = false;
                        $scope.finished = true;
                        $scope.started = false;
                    },
                    getMapBounds: getMapBounds,
                    centerMap: centerMap
                }
            );
        };

        $scope.stop = function () {
            $scope.started = false;
        };

        $scope.showResults = function (_new, extractor, geocoding, bbox) {
            $scope.currentNew = _new;
            $scope.tableData = [];
            var chartData = {
                labels: [],
                datasets: [
                    {
                        label: "Fma",
                        pointHighlightStroke: "rgba(255, 153, 153, 1)",
                        fillColor: "rgba(255, 102, 102, 0.2)",
                        strokeColor: "rgba(255, 51, 51, 1)",
                        pointColor: "rgba(204, 0, 0, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        data: []
                    },
                    {
                        label: "Fmg",
                        pointHighlightStroke: "rgba(153, 255, 255, 1)",
                        fillColor: "rgba(102, 255, 255, 0.2)",
                        strokeColor: "rgba(51, 255, 255, 1)",
                        pointColor: "rgba(0, 204, 204, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        data: []
                    }
                ]
            };
            var count = 0;
            _new.subtitles.forEach(function (subtitle) {
                var result = Processor.getResultFromSubtitle(subtitle, extractor, geocoding, bbox);
                $scope.tableData.push(result);
                if (count % 10 == 0) Processor.addDataToChartData(chartData, result);
                count++;
            });
            //chart.Line(chartData, chartOptions);
            //legend(document.getElementById("chartLegend"), chartData);
        };

        $scope.resultsParams = function () {
            var result = [];
            if ($scope.tableData.length > 0) {
                for (var prop in $scope.tableData[0]) {
                    if (prop != '$$hashKey') result.push(prop);
                }
            }
            return result;
        };

        function initMap() {
            if (!map) map = L.map('map');
            map.setView([40.095, -3.823], 4);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        function initChart() {
            context = document.getElementById("chart").getContext("2d");
            chart = new Chart(context);
        }

        function getMapBounds() {
            if (!map) return null;
            return [
                [map.getBounds().getSouthWest().lat, map.getBounds().getSouthWest().lng],
                [map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng]
            ];
        }

        function centerMap(bbox, relevantBbox, retrievedTerms, relevantTerms) {
            if (!map) return;
            if (bbox.length == 0) return;
            if (bbox.length > 2) {
                bbox = [bbox[0], bbox[2]];
            }
            var sw = L.latLng(bbox[0][0], bbox[0][1]);
            var ne = L.latLng(bbox[1][0], bbox[1][1]);
            var bounds = L.latLngBounds(sw, ne);
            var center = bounds.getCenter();
            var zoom = map.getBoundsZoom(bounds);
            try {
                map.setView(center, zoom, {animate: false});
            } catch (e) {
                console.log('bounds: ' + JSON.stringify(bounds));
                console.log('retrievedBbox: ' + JSON.stringify(bbox));
                console.log('relevantBbox: ' + JSON.stringify(relevantBbox));
                console.log('retrievedTerms: ' + JSON.stringify(retrievedTerms));
                console.log('relevantTerms: ' + JSON.stringify(relevantTerms));
                console.log(e);
            }
        }

        function legend(parent, data) {
            parent.className = 'legend';
            var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

            // remove possible children of the parent
            while (parent.hasChildNodes()) {
                parent.removeChild(parent.lastChild);
            }

            datas.forEach(function (d) {
                var title = document.createElement('span');
                title.className = 'title';
                title.style.borderColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
                title.style.borderStyle = 'solid';
                parent.appendChild(title);

                var text = document.createTextNode(d.label);
                title.appendChild(text);
            });
        }
    }
]);