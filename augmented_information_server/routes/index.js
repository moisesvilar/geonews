/**
 * Created by Moises Vilar on 07/10/2014.
 */

var augmented_information = require('./augmented_information');
var subtitles = require('./subtitles');
var errors = require('./errors');

module.exports = function(app) {
    augmented_information(app);
    subtitles(app);
    errors(app);
};