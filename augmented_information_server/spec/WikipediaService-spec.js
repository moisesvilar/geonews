/**
 * Created by ctdesk241 on 09/10/2014.
 */

var WikipediaService = require('../services/WikipediaService').WikipediaService;

describe('wikipedia service', function() {

    var title = 'Ferrol';
    var checkUrl = 'http://en.wikipedia.org/wiki/Ferrol,_Galicia';

    it('should retrieves the english url for the page titled Ferrol', function(done) {
        WikipediaService.queryLangLinks(title, function(err, url) {
            expect(err).toBeFalsy();
            expect(url).toBeDefined();
            expect(url).toBeString();
            expect(url).toEqual(checkUrl);
            done();
        });
    });

});