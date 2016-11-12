/**
 * Created by Moises Vilar on 05/11/2014.
 */

var pg = require('pg');

function BoundingBoxService(){
}

// BoundingBoxService.CONNECTION_STRING = 'postgres://postgres:1234@localhost/ai';
// BoundingBoxService.CONNECTION_STRING = 'postgres://postgres:postgres@172.16.243.183/ai';
BoundingBoxService.CONNECTION_STRING = 'postgres://postgres:Hbbtv1184@172.16.244.137/ai';
BoundingBoxService.QUERY_AREA = 'select getboundingbox_by_area($1::double precision, $2::double precision, $3:: varchar) as geojson';
BoundingBoxService.QUERY_PERIMETER = 'select getboundingbox_by_perimeter($1::double precision, $2::double precision, $3:: varchar) as geojson';
BoundingBoxService.QUERY_DISTANCE_AREA = 'select getboundingbox_by_distance_and_area($1::double precision, $2::double precision, $3:: varchar) as geojson';
BoundingBoxService.QUERY_DISTANCE_PERIMETER = 'select getboundingbox_by_distance_and_perimeter($1::double precision, $2::double precision, $3:: varchar) as geojson';
BoundingBoxService.QUERY_ASPECT_PERIMETER = 'select getboundingbox_by_aspect_and_perimeter($1::double precision, $2::double precision, $3::varchar, $4::double precision, $5::double precision) as geojson';
BoundingBoxService.QUERY_ASPECT_AREA = 'select getboundingbox_by_aspect_and_area($1::double precision, $2::double precision, $3::varchar, $4::double precision, $5::double precision) as geojson';

BoundingBoxService.prototype.get = function(lat, lon, term, options, callback) {
    pg.connect(BoundingBoxService.CONNECTION_STRING, function(err, client, done) {
        if(err) return callback('error fetching client from pool ' + err);
        var query = '';
        if (!options.getBoundingBox || !options.getBoundingBox.type) query = BoundingBoxService.QUERY_PERIMETER;
        else if (options.getBoundingBox.type == 'aspect' && !options.getBoundingBox.dimensions) return callback('dimensions is a required parameter for this getBoundingBox method');
        else if (options.getBoundingBox.type == 'aspect' && !options.getBoundingBox.dimensions.w) return callback('dimensions.w is a required parameter for this getBoundingBox method');
        else if (options.getBoundingBox.type == 'aspect' && !options.getBoundingBox.dimensions.h) return callback('dimensions.h is a required parameter for this getBoundingBox method');
        else if (options.getBoundingBox.type == 'area') query = BoundingBoxService.QUERY_AREA;
        else if (options.getBoundingBox.type == 'perimeter') query = BoundingBoxService.QUERY_PERIMETER;
        else if (options.getBoundingBox.type == 'distance_area') query = BoundingBoxService.QUERY_DISTANCE_AREA;
        else if (options.getBoundingBox.type == 'distance_perimeter') query = BoundingBoxService.QUERY_DISTANCE_PERIMETER;
        else if (options.getBoundingBox.type == 'aspect_area') query = BoundingBoxService.QUERY_ASPECT_AREA;
        else if (options.getBoundingBox.type == 'aspect_perimeter') query = BoundingBoxService.QUERY_ASPECT_PERIMETER;
        else return callback('getBoundingBox method not supported');

        var params = [lat, lon, term];
        if (options.getBoundingBox && (options.getBoundingBox.type == 'aspect_area' || options.getBoundingBox.type == 'aspect_perimeter')) {
            params.push(options.getBoundingBox.dimensions.w, options.getBoundingBox.dimensions.h);
        }

        client.query(query, params, function(err, result) {
            done();
            if(err) return callback('error running query ' + err);
            if (!result.rows[0].geojson) return callback('no bounding box (wtf!?)');
            result.rows[0].geojson = result.rows[0].geojson.split('\\"').join('"');
            result.rows[0].geojson = result.rows[0].geojson.split('"{').join('{');
            result.rows[0].geojson = result.rows[0].geojson.split('}"').join('}');
            var geojson = JSON.parse(result.rows[0].geojson);
            if (!geojson) return callback('geojson is falsy');
            return callback(null, {
                name: geojson.name,
                bbox: [geojson.bbox.coordinates[0][0].reverse(), geojson.bbox.coordinates[0][1].reverse(), geojson.bbox.coordinates[0][2].reverse(), geojson.bbox.coordinates[0][3].reverse()],
                wkbbox: [geojson.wkbbox.coordinates[0][0].reverse(), geojson.wkbbox.coordinates[0][1].reverse(), geojson.wkbbox.coordinates[0][2].reverse(), geojson.wkbbox.coordinates[0][3].reverse()]
            });
        });
    });
};

exports.BoundingBoxService = new BoundingBoxService();