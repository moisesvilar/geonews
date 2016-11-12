/**
 * Created by Moises Vilar on 10/10/2014.
 */

require('jasmine-expect');

var AugmentedInformationService = require('../services/AugmentedInformationService').AugmentedInformationService;
var mongoose = require('mongoose');

describe('Augmented information service', function() {

    it ('should retrieve the title from a resource URL', function() {
        var resource = 'http://es.dbpedia.org/resource/Mariupol';
        var checkTitle = 'Mariupol';
        var title = AugmentedInformationService._getTitleFromResource(resource);
        expect(title).toEqual(checkTitle);
    });

    it('should retrieve the Dbpedia URL from the Wikipedia URL', function() {
        var wikipediaUrl = 'http://en.wikipedia.org/wiki/Mariupol';
        var checkDbpediaUrl = 'http://dbpedia.org/resource/Mariupol';
        var dbpediaUrl = AugmentedInformationService._getDbpediaUrlFromWikipediaUrl(wikipediaUrl);
        expect(dbpediaUrl).toEqual(checkDbpediaUrl);
    });

});

describe('Augmented information service with Adega and Geonames', function() {

    afterEach(function(done){
        mongoose.connection.removeAllListeners('open');
        mongoose.disconnect(done);
    });

    it('should retrieve the geodata inside a text string', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var text = 'Han pasado tres días en Mariupol';
            AugmentedInformationService.search(text, function(err, result) {
                console.log(result);
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text object', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = new Text(0, 'Han pasado tres días en Mariupol', 'es');
            AugmentedInformationService.search(entry, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text array', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = [
                new Text(0, 'Han pasado tres días en Mariupol,', 'es'),
                new Text(1, 'al oeste de Ucrania,', 'es'),
                new Text(2, 'desde que comenzaron los tiroteos', 'es')
            ];
            AugmentedInformationService.search(entry, function (err, results) {
                expect(err).toBeFalsy();
                expect(results).toBeObject();
                for(var ns in results) {
                    var result = results[ns];
                    expect(result).toBeArrayOfObjects();
                    result.forEach(function(term) {
                        expect(term.label).toBeString();
                        expect(term.ns).toBeNumber();
                        expect(term.geodata).toBeArrayOfObjects();
                        term.geodata.forEach(function(geo) {
                            expect(geo.name).toBeString();
                            expect(geo.country).toBeString();
                            expect(geo.admin).toBeString();
                            expect(geo.lat).toBeNumber();
                            expect(geo.lon).toBeNumber();
                        });
                    });
                }
                done();
            });
        });
    });
});

describe('Augmented information service with Stanford and Geonames', function() {

    var options = {
        geocoding: 'geonames',
        terms_extractor: 'stanford'
    };

    afterEach(function(done){
        mongoose.connection.removeAllListeners('open');
        mongoose.disconnect(done);
    });

    it('should retrieve the geodata inside a text string', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var text = 'Han pasado tres días en Mariupol';
            AugmentedInformationService.search(text, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text object', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = new Text(0, 'Han pasado tres días en Mariupol', 'es');
            AugmentedInformationService.search(entry, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text array', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = [
                new Text(0, 'Han pasado tres días en Mariupol,', 'es'),
                new Text(1, 'al oeste de Ucrania,', 'es'),
                new Text(2, 'desde que comenzaron los tiroteos', 'es')
            ];
            AugmentedInformationService.search(entry, options, function (err, results) {
                expect(err).toBeFalsy();
                expect(results).toBeObject();
                for(var ns in results) {
                    var result = results[ns];
                    expect(result).toBeArrayOfObjects();
                    result.forEach(function(term) {
                        expect(term.label).toBeString();
                        expect(term.ns).toBeNumber();
                        expect(term.geodata).toBeArrayOfObjects();
                        term.geodata.forEach(function(geo) {
                            expect(geo.name).toBeString();
                            expect(geo.country).toBeString();
                            expect(geo.admin).toBeString();
                            expect(geo.lat).toBeNumber();
                            expect(geo.lon).toBeNumber();
                        });
                    });
                }
                done();
            });
        });
    });
});

describe('Augmented information service with Adega and OpenStreetMaps', function() {

    var options = {
        geocoding: 'openstreetmaps',
        terms_extractor: 'adega'
    };

    afterEach(function(done){
        mongoose.connection.removeAllListeners('open');
        mongoose.disconnect(done);
    });

    it('should retrieve the geodata inside a text string', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var text = 'Han pasado tres días en Mariupol';
            AugmentedInformationService.search(text, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text object', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = new Text(0, 'Han pasado tres días en Mariupol', 'es');
            AugmentedInformationService.search(entry, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text array', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = [
                new Text(0, 'Han pasado tres días en Mariupol,', 'es'),
                new Text(1, 'al oeste de Ucrania,', 'es'),
                new Text(2, 'desde que comenzaron los tiroteos', 'es')
            ];
            AugmentedInformationService.search(entry, options, function (err, results) {
                expect(err).toBeFalsy();
                expect(results).toBeObject();
                for(var ns in results) {
                    var result = results[ns];
                    expect(result).toBeArrayOfObjects();
                    result.forEach(function(term) {
                        expect(term.label).toBeString();
                        expect(term.ns).toBeNumber();
                        expect(term.geodata).toBeArrayOfObjects();
                        term.geodata.forEach(function(geo) {
                            expect(geo.name).toBeString();
                            expect(geo.country).toBeString();
                            expect(geo.admin).toBeString();
                            expect(geo.lat).toBeNumber();
                            expect(geo.lon).toBeNumber();
                        });
                    });
                }
                done();
            });
        });
    });
});

describe('Augmented information service with Stanford and OpenStreetMaps', function() {

    var options = {
        geocoding: 'openstreetmaps',
        terms_extractor: 'stanford'
    };

    afterEach(function(done){
        mongoose.connection.removeAllListeners('open');
        mongoose.disconnect(done);
    });

    it('should retrieve the geodata inside a text string', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var text = 'Han pasado tres días en Mariupol';
            AugmentedInformationService.search(text, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text object', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = new Text(0, 'Han pasado tres días en Mariupol', 'es');
            AugmentedInformationService.search(entry, options, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeArrayOfObjects();
                result.forEach(function(term) {
                    expect(term.label).toBeString();
                    expect(term.ns).toBeNumber();
                    expect(term.geodata).toBeArrayOfObjects();
                    term.geodata.forEach(function(geo) {
                        expect(geo.name).toBeString();
                        expect(geo.country).toBeString();
                        expect(geo.admin).toBeString();
                        expect(geo.lat).toBeNumber();
                        expect(geo.lon).toBeNumber();
                    });
                });
                done();
            });
        });
    });

    it('should retrieve the geodata inside a text array', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            var Text = require('../services/AugmentedInformationService').Text;
            var entry = [
                new Text(0, 'Han pasado tres días en Mariupol,', 'es'),
                new Text(1, 'al oeste de Ucrania,', 'es'),
                new Text(2, 'desde que comenzaron los tiroteos', 'es')
            ];
            AugmentedInformationService.search(entry, options, function (err, results) {
                expect(err).toBeFalsy();
                expect(results).toBeObject();
                for(var ns in results) {
                    var result = results[ns];
                    expect(result).toBeArrayOfObjects();
                    result.forEach(function(term) {
                        expect(term.label).toBeString();
                        expect(term.ns).toBeNumber();
                        expect(term.geodata).toBeArrayOfObjects();
                        term.geodata.forEach(function(geo) {
                            expect(geo.name).toBeString();
                            expect(geo.country).toBeString();
                            expect(geo.admin).toBeString();
                            expect(geo.lat).toBeNumber();
                            expect(geo.lon).toBeNumber();
                        });
                    });
                }
                done();
            });
        });
    });
});