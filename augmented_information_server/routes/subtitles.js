/**
 * Created by Moises Vilar on 27/10/2014.
 */

require('../models');

var mongoose = require('mongoose');
var Subtitles = mongoose.model('Subtitles');

var STATE_QUERY_PARAM = 'state';
var GEODATA_QUERY_PARAM = 'geodata';

module.exports = function(app) {

    app.get('/subtitles', function(req, res, next) {
        Subtitles.find({}, {_id:1, title:1, state:1}, function(err, subtitles) {
            if (err) {
                console.log('error retrieving all subtitles: ' + err);
                err.status = 500;
                next(err);
            }
            try {
                res.json(subtitles);
            } catch(e) {
                console.log('exception: ' + e);
            }
        });
    });

    app.get('/subtitles/:id', function(req,res,next) {
        Subtitles.findById(req.param('id'), function(err, subtitle){
            if (err) {
                console.log('error retrieving subtitle %s: %s', req.param('id'), err);
                err.status = 500;
                next(err);
            }
            try {
                res.json(subtitle);
            } catch(e) {
                console.log('exception: ' + e);
            }
        });
    });

    app.put('/subtitles/:id', function(req, res, next) {
        var state = req.body[STATE_QUERY_PARAM];
        if (!state) {
            var error = new Error('Parameter state is required');
            error.status = 500;
            return next(error);
        }
        var id = req.param('id');
        var query = {_id: id};
        var update = { state: state };
        Subtitles.update(query, update, function(err, count) {
            if (err) {
                console.log('error updating subtitle %s: %s', id, err);
                err.status = 500;
                return next(err);
            }
            else if (count == 0) {
                var err = new Error('Subtitle does not exist');
                err.status = 404;
                return next(err);
            }
            res.sendStatus(200);
        });
    });

    app.put('/subtitles/:id/:ns', function(req, res, next) {
        var geodata = req.body[GEODATA_QUERY_PARAM];
        var error = null;
        if (!geodata) {
            console.log('Parameter geodata is required');
            error = new Error('Parameter geodata is required');
            error.status = 500;
            return next(error);
        }
        try {
            geodata = JSON.parse(geodata);
        } catch(e) {
            console.log('parsing geodata %s: %s', geodata, e);
            error = new Error(e);
            error.status = 500;
            return next(error);
        }
        var id = req.param('id');
        var ns = req.param('ns');
        var query = {
            _id: id,
            'subtitles.ns': ns
        };
        var update = {
            state: 1,
            '$set': {
                'subtitles.$.geodata': geodata
            }
        };
        Subtitles.update(query, update, function(err, count) {
            if (err) {
                console.log('error updating geodata in subtitle %s with ns %s: %s', id, ns, err);
                error = new Error(err);
                error.status = 500;
                return next(error);
            }
            else if (count == 0) {
                console.log('Subtitle does not exist');
                error = new Error('Subtitle does not exist');
                error.status = 404;
                return next(error);
            }
            res.sendStatus(200);
        });
    });

};