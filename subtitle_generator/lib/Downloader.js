/**
 * Created by Moises Vilar on 14/10/2014.
 */

function Downloader() {
}

Downloader.prototype.request = require('request');

Downloader.prototype.download = function(url, callback) {
    this._get(url, function(err, html) {
        if (err) return callback(err);
        return callback(null, html);
    });
};

Downloader.prototype._get = function(url, callback) {
    this.request(url, function(error, response, body) {
        if (error) return callback(error);
        if (!response.statusCode == 200) return callback(response.statusCode);
        callback(null, body);
    });
};

exports.Downloader = new Downloader();