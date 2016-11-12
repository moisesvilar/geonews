/**
 * Created by ctdesk241 on 10/10/2014.
 */

require('jasmine-expect');

var GeonamesService = require('../services/GeonamesService').GeonamesService;
var username = 'moises.vilar@usc.es';

describe('Geonames service', function() {

    var query = 'mariupol';
    var checkJson = {
            countryId : '690791',
            adminCode1 : '05',
            countryName : 'Ucrania',
            fclName : 'city, village,...',
            countryCode : 'UA',
            lng : '37.54131',
            fcodeName : 'populated place',
            toponymName : 'Mariupol',
            fcl : 'P',
            name : 'Mariupol',
            fcode : 'PPL',
            geonameId : 701822,
            lat : '47.09514',
            adminName1 : 'Donetsk',
            population : 481626
        };

    it('should retrieve the coordinates of Mariupol', function(done) {
        GeonamesService.search(username, query, function(err, data) {
            expect(err).toBeFalsy();
            expect(data.totalResultsCount).toBeNumber();
            expect(data.geonames).toBeArrayOfObjects();
            expect(data.geonames.length).toEqual(data.totalResultsCount);
            expect(data.geonames[0]).toEqual(checkJson);
            done();
        });
    });

});