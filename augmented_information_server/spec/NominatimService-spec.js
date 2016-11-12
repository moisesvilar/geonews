/**
 * Created by Moises Vilar on 21/10/2014.
 */

require('jasmine-expect');

var NominatimService = require('../services/NominatimService').NominatimService;

describe('Nominatim service', function() {

    var query = 'galicia';
    var checkJson = {
        "place_id" : "158790487",
        "licence" : "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright",
        "osm_type" : "relation",
        "osm_id" : "349036",
        "boundingbox" : ["41.8070294", "43.790422", "-9.3015366", "-6.7339532"],
        "lat" : "42.61946",
        "lon" : "-7.863112",
        "display_name" : "Galicia, Espa\u00f1a",
        "class" : "boundary",
        "type" : "administrative",
        "importance" : 0.7617989633069,
        "icon" : "http:\/\/nominatim.openstreetmap.org\/images\/mapicons\/poi_boundary_administrative.p.20.png",
        "address" : {
            "state" : "Galicia",
            "country" : "Espa\u00f1a",
            "country_code" : "es"
        }
    };

    it('should retrieve the coordinates of Galicia', function(done) {
        NominatimService.search(query, function(err, data) {
            expect(err).toBeFalsy();
            expect(data).toBeArrayOfObjects();
            expect(data.length).toEqual(1);
            expect(data[0]).toEqual(checkJson);
            done();
        });
    });

});