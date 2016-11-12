/**
 * Created by ctdesk241 on 10/10/2014.
 */

var AbstractService = require('./AbstractService').AbstractService;

/**
 * Service for Geonames API.
 * @constructor
 */
function GeonamesService(){
    AbstractService.call(this);
}

GeonamesService.HOST = 'api.geonames.org';
GeonamesService.PORT = '80';
GeonamesService.ENTRY_POINT = '/searchJSON';
GeonamesService.DEFAULT_MAX = 1;
GeonamesService.DEFAULT_LANG = 'es';

/**
 * GeonamesService extends for AbstractService.
 * @type {AbstractService}
 */
GeonamesService.prototype = new AbstractService();
GeonamesService.prototype.constructor = GeonamesService;

/**
 * Searchs in Geonames the specified query string.
 * @param username The username for Geonames API.
 * @param query The query string. @required.
 * @param lang ISO 639-1 language code. @optional. @default es.
 * @param callback The callback function. It takes two parameters: error (or null) and the search's results. @required.
 */
GeonamesService.prototype.search = function(username, query, lang, callback) {
    if (lang instanceof Function) {
        callback = lang;
        lang = undefined;
    }
    if (!lang) lang = GeonamesService.DEFAULT_LANG;
    var parameters = {
        username: username,
        name_equals: query,
        lang: lang
    };
    var options = {
        host: GeonamesService.HOST,
        port: GeonamesService.PORT,
        path: GeonamesService.ENTRY_POINT,
        method: 'GET'
    };
    this.get(options, parameters, function(err, data) {
        if (err) return callback(err);
        data = JSON.parse(data);
        return callback(null, data);
    });
};

exports.GeonamesService = new GeonamesService();