/**
 * Created by Moises Vilar on 12/12/2014.
 */

angular.module('app').factory('Processor', [
    '$timeout',
    'SubtitlesGeodata',
    'AugmentedInformation',
    'GeometricUtils',
    function ($timeout, SubtitlesGeodata, AugmentedInformation, GeometricUtils) {
        var Processor = {};
        var aiService = new AugmentedInformation();

        function getIntersectionTermsNumber(c1, c2) {
            if (c1.constructor === Array && c2.constructor === Array) {
            }
            else if (c2.constructor === Array) {
                c1 = [c1];
            }
            else if (c1.constructor === Array) {
                c2 = [c2];
            }
            else {
                if (c1.text.toLowerCase() == c2.text.toLowerCase()) return 1;
                else return 0;
            }
            var count = 0;
            c1.forEach(function (t1) {
                c2.forEach(function (t2) {
                    if (t1.text.toLowerCase() == t2.text.toLowerCase()) count++;
                });
            });
            return count;
        }

        function getTermsNumber(c) {
            if (c.constructor === Array) return c.length;
            else return 1;
        }

        Processor.processVersion1 = function (parameters, callbacks) {
            callbacks.beforeProcess();
            var tasks = [];
            parameters.selectedNews.forEach(function (_new) {
                tasks.push(function (processingCallback) {
                    _new = SubtitlesGeodata.get({id: _new._id}, function () {
                        parameters.processedNews.push(_new);
                        var totalSubtitles = _new.subtitles.length * parameters.selectedTermsExtractors.length * parameters.selectedGeocodingMethods.length * parameters.selectedBboxMethods.length;
                        callbacks.updateTotalSubtitles(totalSubtitles);
                        parameters.selectedTermsExtractors.forEach(function (termsExtractor) {
                            parameters.selectedGeocodingMethods.forEach(function (geocodingMethod) {
                                parameters.selectedBboxMethods.forEach(function (bboxMethod) {
                                    var subtitlesTasks = [];
                                    _new.subtitles.forEach(function (subtitle) {
                                        subtitlesTasks.push(function (subtitleCallback) {
                                            var options = {
                                                terms_extractor: termsExtractor,
                                                geocoding: geocodingMethod,
                                                getBoundingBox: {
                                                    type: bboxMethod,
                                                    dimensions: {
                                                        w: parameters.mapSize.x,
                                                        h: parameters.mapSize.y
                                                    }
                                                }
                                            };
                                            aiService.search(subtitle.text, options).success(function (data) {
                                                if (!subtitle.geodata_calc) subtitle.geodata_calc = [];
                                                if (data.length == 0) data = {};
                                                else if (!data[0].geodata || data[0].geodata.length == 0) data = {};
                                                else {
                                                    data = {
                                                        marker: {
                                                            text: data[0].label,
                                                            point: {
                                                                lat: data[0].geodata[0].lat,
                                                                lon: data[0].geodata[0].lon
                                                            }
                                                        },
                                                        bbox: data[0].geodata[0].bbox
                                                    }
                                                }
                                                subtitle.geodata_calc.push({
                                                    options: options,
                                                    geodata: data
                                                });
                                                callbacks.processing();
                                                subtitleCallback();
                                            });
                                        });
                                    });
                                    async.series(subtitlesTasks, function (err) {
                                        if (err) console.log(err);
                                        $timeout(function () {
                                            processingCallback(err);
                                        }, 300);
                                    });
                                });
                            });
                        });
                    });
                });
            });
            $timeout(function () {
                async.series(tasks, function (err) {
                    if (err) return console.log(err);
                    callbacks.beforeValidation();
                    var tasks = [];
                    parameters.processedNews.forEach(function (_new) {
                        tasks.push(function (validatingCallback) {
                            var terms = [];
                            _new.subtitles.forEach(function (subtitles) {
                                var relevantBbox = subtitles.geodata.boundingbox;
                                var relevantTerms = subtitles.geodata.markers;
                                subtitles.geodata_calc.forEach(function (geodata_calc) {
                                    var retrievedBbox = geodata_calc.geodata.bbox ? geodata_calc.geodata.bbox : [];
                                    var retrievedTerms = geodata_calc.geodata.marker ? [geodata_calc.geodata.marker] : null;
                                    var Pa, Ra, Fa, Pt, Rt, Ft, Fma, Fmg;
                                    if (relevantBbox.length == 0) {
                                        Pa = 1;
                                        Ra = 1;
                                        Fa = 1;
                                    }
                                    else if (retrievedBbox.length == 0) {
                                        retrievedBbox = callbacks.getMapBounds();
                                        Pa = GeometricUtils.getIntersectionArea(retrievedBbox, relevantBbox) / GeometricUtils.getArea(retrievedBbox);
                                        Ra = GeometricUtils.getIntersectionArea(retrievedBbox, relevantBbox) / GeometricUtils.getArea(relevantBbox);
                                        if (Pa == 0 && Ra == 0) Fa = 0;
                                        else Fa = 2 * ((Pa * Ra) / (Pa + Ra));
                                    }
                                    else {
                                        callbacks.centerMap(retrievedBbox, relevantBbox, retrievedTerms, relevantTerms);
                                        retrievedBbox = callbacks.getMapBounds();
                                        Pa = GeometricUtils.getIntersectionArea(retrievedBbox, relevantBbox) / GeometricUtils.getArea(retrievedBbox);
                                        Ra = GeometricUtils.getIntersectionArea(retrievedBbox, relevantBbox) / GeometricUtils.getArea(relevantBbox);
                                        if (Pa == 0 && Ra == 0) Fa = 0;
                                        else Fa = 2 * ((Pa * Ra) / (Pa + Ra));
                                    }
                                    if (retrievedTerms) terms = retrievedTerms;
                                    if (terms.length == 0 && relevantTerms.length > 0) {
                                        Pt = 0;
                                        Rt = 0;
                                        Ft = 0;
                                    }
                                    else if (relevantTerms.length == 0) {
                                        Pt = 1;
                                        Rt = 1;
                                        Ft = 1;
                                    }
                                    else {
                                        Pt = getIntersectionTermsNumber(terms, relevantTerms) / getTermsNumber(terms);
                                        Rt = getIntersectionTermsNumber(terms, relevantTerms) / getTermsNumber(relevantTerms);
                                        if (Pt == 0 && Rt == 0) Ft = 0;
                                        else Ft = 2 * ((Pt * Rt) / (Pt + Rt));
                                    }
                                    var a = parameters.alpha;
                                    Fma = a * Fa + (1 - a) * Ft;
                                    Fmg = Math.pow(Fa, a) * Math.pow(Ft, (1 - a));
                                    geodata_calc.evaluation = {
                                        Fma: Fma,
                                        Fmg: Fmg,
                                        relevantBbox: relevantBbox,
                                        relevantTerms: relevantTerms,
                                        retrievedBbox: retrievedBbox,
                                        retrievedTerms: terms,
                                        Pa: Pa,
                                        Ra: Ra,
                                        Fa: Fa,
                                        Pt: Pt,
                                        Rt: Rt,
                                        Ft: Ft
                                    };
                                    callbacks.validating();
                                });
                            });
                            $timeout(function () {
                                validatingCallback();
                            }, 300);
                        });
                    });
                    $timeout(function () {
                        async.series(tasks, function (err) {
                            if (err) return console.log(err);
                            callbacks.finish();
                        });
                    }, 1000);
                });
            }, 1000);
        };

        Processor.addDataToChartData = function(chartData, result) {
            chartData.labels.push(result.ns);
            chartData.datasets[0].data.push(result.Fma);
            chartData.datasets[1].data.push(result.Fmg);
        };

        Processor.getResultFromSubtitle = function(subtitle, extractor, geocoding, bbox) {
            var ns = subtitle.ns;
            var text = subtitle.text;
            var relevantBbox = [];
            var relevantTerms = [];
            var retrievedBbox = [];
            var retrievedTerms = [];
            var Pa = 0;
            var Ra = 0;
            var Fa = 0;
            var Pt = 0;
            var Rt = 0;
            var Ft = 0;
            var Fma = 0;
            var Fmg = 0;
            if (subtitle.geodata_calc && subtitle.geodata_calc.length > 0) {
                subtitle.geodata_calc.forEach(function (geodata_calc) {
                    if (geodata_calc.options && geodata_calc.options.getBoundingBox.type) {
                        if (geodata_calc.options.terms_extractor == extractor && geodata_calc.options.geocoding == geocoding && geodata_calc.options.getBoundingBox.type == bbox) {
                            if (geodata_calc.evaluation && geodata_calc.evaluation.relevantBbox) {
                                relevantBbox = geodata_calc.evaluation.relevantBbox;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.relevantTerms) {
                                geodata_calc.evaluation.relevantTerms.forEach(function (relevantTerm) {
                                    relevantTerms.push(relevantTerm.text);
                                });
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.retrievedBbox) {
                                retrievedBbox = geodata_calc.evaluation.retrievedBbox;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.retrievedTerms) {
                                geodata_calc.evaluation.retrievedTerms.forEach(function (retrievedTerm) {
                                    retrievedTerms.push(retrievedTerm.text);
                                });
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Pa) {
                                Pa = geodata_calc.evaluation.Pa;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Ra) {
                                Ra = geodata_calc.evaluation.Ra;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Fa) {
                                Fa = geodata_calc.evaluation.Fa;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Pt) {
                                Pt = geodata_calc.evaluation.Pt;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Rt) {
                                Rt = geodata_calc.evaluation.Rt;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Ft) {
                                Ft = geodata_calc.evaluation.Ft;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Fma) {
                                Fma = geodata_calc.evaluation.Fma;
                            }
                            if (geodata_calc.evaluation && geodata_calc.evaluation.Fmg) {
                                Fmg = geodata_calc.evaluation.Fmg;
                            }
                        }
                    }
                });
            }
            return {
                ns: ns,
                text: text,
                relevantBbox: relevantBbox,
                retrievedBbox: retrievedBbox,
                relevantTerms: relevantTerms,
                retrievedTerms: retrievedTerms,
                Pa: Pa,
                Ra: Ra,
                Fa: Fa,
                Pt: Pt,
                Rt: Rt,
                Ft: Ft,
                Fma: Fma,
                Fmg: Fmg
            };
        };

        return Processor;
    }]);