/**
 * Created by Moises Vilar on 21/10/2014.
 */

require('jasmine-expect');

var StanfordNlpService = require('../services/StanfordNlpService').StanfordNlpService;

describe('Stanford NLP service', function() {

    var text = 'El descubrimiento fue realizado en Estados Unidos, en la ciudad de Michigan';

    it('should find the location entities in text', function(done) {
        setTimeout(function() {
            StanfordNlpService.search(text, function(err, data){
                expect(err).toBeFalsy();
                expect(data).toBeArrayOfStrings();
                expect(data.length).toEqual(2);
                expect(data[0]).toEqual('Estados Unidos');
                expect(data[1]).toEqual('Michigan');
                done();
            });
        }, 1000);
    });

});