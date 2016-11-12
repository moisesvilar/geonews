/**
 * Created by Moises Vilar on 08/10/2014.
 */

function AbstractService(){
}

AbstractService.prototype.querystring = require('querystring');
AbstractService.prototype.http = require('http');

AbstractService.prototype.get = function(options, data, callback) {
    var qs = this.querystring.stringify(data);
    options.path += '?' + qs;
    var req = this.http.request(options, function(res) {
        res.setEncoding('utf8');
        if (res.statusCode != 200) {
            return callback(res.statusCode);
        }
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });
        res.on('end', function() {
            callback(null, body);
        });
        res.on('error', function(e) {
            callback(e.message);
        });
    });
    req.end();
};

/**
 * Makes a POST request.
 * @param options The options object.
 * @param data The data object.
 * @param callback The callback function
 */
AbstractService.prototype.post = function(options, data, callback) {
    var formData = this.querystring.stringify(data);
    var req = this.http.request(options, function(res) {
        res.setEncoding('utf8');
        if (res.statusCode != 200) {
            return callback(res.statusCode);
        }
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });
        res.on('end', function() {
            callback(null, body);
        });
        res.on('error', function(e) {
            callback(e.message);
        });
    });
    req.write(formData);
    req.end();
};

exports.AbstractService = AbstractService;