/**
 * Created by Moises Vilar on 07/10/2014.
 */

var PORT = 8080;

var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var routes = require('./routes');

mongoose.connect('mongodb://cthda02.usc.es:9160/augmented_information', function (err) {
    if (err) throw err;

    var app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
    routes(app);

    try {
        app.listen(PORT, function () {
            console.log('Server listening on port ' + PORT);
        });
    } catch (e){
        console.log(e);
    }
});