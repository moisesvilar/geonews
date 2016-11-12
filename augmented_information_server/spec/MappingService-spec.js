/**
 * Created by Moises Vilar on 10/10/2014.
 */

require('jasmine-expect');

var MappingService = require('../services/MappingService').MappingService;
var mongoose = require('mongoose');

describe('Mapping service', function() {

    var ferrolUrl = 'http://dbpedia.org/resource/Ferrol,_Galicia';
    var steveUrl = 'http://dbpedia.org/resource/Steve_Jobs';

    afterEach(function(done){
        mongoose.connection.removeAllListeners('open');
        mongoose.disconnect(done);
    });

    it('should retrieve that Ferrol is a place', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            MappingService.isPlace(ferrolUrl, function(err, isPlace) {
                expect(err).toBeFalsy();
                expect(isPlace).toBeTrue();
                done();
            });
        });
    });

    it('should retrieve that Steve Jobs is not a place', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function (err) {
            expect(err).toBeFalsy();
            MappingService.isPlace(steveUrl, function(err, isPlace) {
                expect(err).toBeFalsy();
                expect(isPlace).toBeFalse();
                done();
            });
        });
    });

});