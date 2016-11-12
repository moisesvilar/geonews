/**
 * Created by Moises Vilar on 05/11/2014.
 */

require('jasmine-expect');

var BoundingBoxService = require('../services/BoundingBoxService').BoundingBoxService;

describe('BoundingBox service', function() {

    var SantiagoCoordinates = [42.877280, -8.547001];
    var OGroveCoordinates = [42.469913, -8.881375];
    var options = {
        terms_extractor: 'adega',
        geocoding: 'geonames',
        getBoundingBox: {
            type: 'aspect_area',
            dimensions: {
                w: 600,
                h: 400
            }
        }
    };

    it('should retrieve the right bounding box for a point at Santiago de Compostela', function(done) {
        BoundingBoxService.get(SantiagoCoordinates[0], SantiagoCoordinates[1], 'adf', options, function(err, result) {
            expect(err).toBeFalsy();
            expect(result).toBeTruthy();
            expect(result).toBeObject();
            expect(result.name).toEqual('Santiago de Compostela');
            done();
        });
    });

    it('should retrieve the right bounding box for a point at O Grove', function(done) {
        BoundingBoxService.get(OGroveCoordinates[0], OGroveCoordinates[1], 'adf', options, function(err, result) {
            expect(err).toBeFalsy();
            expect(result).toBeTruthy();
            expect(result).toBeObject();
            expect(result.name).toEqual('Pontevedra');
            done();
        });
    });

});