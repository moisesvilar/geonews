/**
 * Created by Moises Vilar on 27/10/2014.
 */

var ENTRY_PARAM_NAME = 'entry';
var OPTIONS_PARAM_NAME = 'options';
var AugmentedInformationService = require('../services/AugmentedInformationService').AugmentedInformationService;

module.exports = function(app) {

    app.post('/ai', function(req, res, next) {
        var entry = req.body[ENTRY_PARAM_NAME];
        var options = req.body[OPTIONS_PARAM_NAME];
        if (!entry) {
            var error = new Error('Parameter entry is required');
            error.status = 500;
            return next(error);
        }
        try {
            entry = JSON.parse(entry);
        } catch(e) {
            console.log(e);
        }
        try {
            options = JSON.parse(options);
        } catch(e) {
            console.log(e);
        }
        AugmentedInformationService.search(entry, options, function(errorMsg, result) {
            if (errorMsg) {
                console.log('error: ' + errorMsg);
                var error = new Error(errorMsg);
                error.status = 500;
                next(error);
            }
            try {
                res.json(result);
            } catch(e) {
                console.log('exception: ' + e);
            }
        });
    });

};