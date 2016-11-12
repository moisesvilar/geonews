/**
 * Created by Moises Vilar on 27/10/2014.
 */

var mongoose = require('mongoose');

/**
 * Schema for subtitle entity
 */
var schema = mongoose.Schema(
    {
        _id: String,
        state: Number,
        title: String,
        subtitles: [{
            ns: String,
            text: String,
            geodata: {
                boundingbox: [],
                markers: []
            }
        }]
    },
    {
        collection: 'subtitles'
    }
);

var Subtitles = mongoose.model('Subtitles', schema, 'subtitles');

module.exports = Subtitles;