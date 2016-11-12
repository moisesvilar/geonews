/**
 * Created by Moises Vilar on 10/10/2014.
 */

require('../models');

function MappingService() {
    this.Mappings = this.mongoose.model('Mappings');
}

MappingService.CONNECTION_STRING = 'mongodb://cthda02.usc.es:9160/dbpedia';

MappingService.prototype.mongoose = require('mongoose');

MappingService.prototype.isPlace = function(url, callback) {
    var id = url;
    if (url[0] != '<') id = '<' + id;
    if (url[url.length-1] != '>') id = id + '>';
    var self = this;
    self.Mappings.isPlace(id, function(err, isPlace) {
        if (err) return callback(err);
        return callback(null, isPlace);
    });
};

exports.MappingService = new MappingService();