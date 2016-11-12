/**
 * Created by Moises Vilar on 21/10/2014.
 */

var AbstractService = require('./AbstractService').AbstractService;

/**
 * Service for Nominatim API.
 * @constructor
 */
function NominatimService(){
    AbstractService.call(this);
}

NominatimService.HOST = 'nominatim.openstreetmap.org';
NominatimService.PORT = '80';
NominatimService.ENTRY_POINT = '/search';

/**
 * NominatimService extends for AbstractService.
 * @type {AbstractService}
 */
NominatimService.prototype = new AbstractService();
NominatimService.prototype.constructor = NominatimService;

/**
 * Searchs in Nominatim the specified query string.
 * @param query The query string. @required.
 * @param callback The callback function. It takes two parameters: error (or null) and the search's results. @required.
 */
NominatimService.prototype.search = function(query, callback) {
    var parameters = {
        q: query.label ? query.label : query,
        addressdetails: 1,
        format: 'json'
    };
    var options = {
        host: NominatimService.HOST,
        port: NominatimService.PORT,
        path: NominatimService.ENTRY_POINT,
        method: 'GET'
    };
    this.get(options, parameters, function(err, data) {
        if (err) return callback(err);
        data = JSON.parse(data);
        return callback(null, data);
    });
};

exports.NominatimService = new NominatimService();