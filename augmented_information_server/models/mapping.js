/**
 * Created by Moisés Vilar on 09/10/2014.
 */

var mongoose = require('mongoose');

/**
 * Schema for mapping entity
 */
var schema = mongoose.Schema(
    {
        _id: String,
        types: [String]
    },
    {
        collection: 'mappings'
    }
);

/**
 * Retrieves if an entity is a place or not.
 * @param id Entity identifier.
 * @param callback The function callback. It takes two parameters: error (or null) and a boolean.
 * @returns {*|Query}
 */
schema.statics.isPlace = function(id, callback) {
    var query = {
        _id: id,
        types: "<http://dbpedia.org/ontology/Place>"
    };
    this.model('Mappings').findOne(query, function(err, doc) {
        if (err) return callback(err);
        if (doc) return callback(null, true);
        else callback(null, false);
    });
};

var Mappings = mongoose.model('Mappings', schema, 'mappings');

module.exports = Mappings;