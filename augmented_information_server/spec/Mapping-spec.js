/**
 * Created by Moises Vilar on 09/10/2014.
 */

require('../models');

var mongoose = require('mongoose');
var Mappings = mongoose.model('Mappings');

describe('Mappings collection', function() {

    var ferrolId = '<http://dbpedia.org/resource/Ferrol,_Galicia>';
    var steveId = '<http://dbpedia.org/resource/Steve_Jobs>';

    it('should retrieve that Ferrol is a place', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function(err) {
            expect(err).toBeFalsy();
            Mappings.isPlace(ferrolId, function(err, isPlace) {
                expect(err).toBeFalsy();
                expect(isPlace).toBeTrue();
                mongoose.connection.close();
                done();
            });
        });
    });

    it('should retrieve that Steve Jobs is not a place', function(done) {
        mongoose.connect('mongodb://cthda02.usc.es:4848/dbpedia', function(err) {
            expect(err).toBeFalsy();
            Mappings.isPlace(steveId, function(err, isPlace) {
                expect(err).toBeFalsy();
                expect(isPlace).toBeFalse();
                mongoose.connection.close();
                done();
            });
        });
    });

});