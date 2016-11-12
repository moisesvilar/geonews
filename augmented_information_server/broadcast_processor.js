console.log('Starting server...');

var PORT = 22000;
var GEODATA_TOPIC = 'geodata';
var SUBTITLE_TOPIC = 'subtitle';
var PERIOD = 1000;

require('./models');

var mongoose = require('mongoose');
var socketio = require('socket.io');
var AugmentedInformationService = require('./services/AugmentedInformationService').AugmentedInformationService;
var io = require('socket.io').listen(PORT);

var Subtitles = mongoose.model('Subtitles');
var newId = "telediario_15_horas_01_09_14_partial";
var options = {
    terms_extractor: 'stanford',
    geocoding: 'openstreetmaps',
    getBoundingBox: {
        type: 'aspect_area',
        dimensions: {
            w: 553,
            h: 300
        }
    }
};

console.log('connecting to mongo database...');
mongoose.connect('mongodb://cthda02.usc.es:9160/augmented_information', function (err) {
    if (err) throw err;
    console.log('connected to mongo database');
    console.log('retrieving subtitles for ' + newId + '...');
    Subtitles.findById(newId, function (err, subtitle) {
        if (err) throw err;
        console.log('retrieved subtitle for ' + newId);
        console.log('launching timer');
        var index = 0;
        var sec = 0;
        var subtitles = subtitle.subtitles;
        console.log(subtitles.length);
        setInterval(function () {
            sec++;
            console.log('sec ' + sec);
            var ns = subtitles[index].ns;
            if (sec == nsToSec(ns) || sec - 1 == nsToSec(ns)) {
                var text = subtitles[index].text;
                var subtitle = {
                    sec: sec,
                    text: text
                };
                console.log('Emitting ' + JSON.stringify(subtitle));
                io.sockets.emit(SUBTITLE_TOPIC, subtitle);
                console.log('index ' + index);
                index++;
                if (index == subtitles.length) {
                    console.log('RESTARTING...');
                    index = 0;
                    sec = 0;
                }
                console.log('processing ' + text);
                AugmentedInformationService.search(text, options, function (err, result) {
                    if (err) return console.log(err);
                    if (!result || result.length == 0) return;
                    //Construir array con todos los datos geográficos (geodata) de result
                    if (!result[0].geodata || !result[0].geodata[0] || !result[0].geodata[0].bbox || !result[0].geodata[0].lat || !result[0].geodata[0].lon) return;
                    printArray(result);
                    var bbox = result[0].geodata[0].bbox;
                    //Construir array de etiquetas, puntos y bboxes
                    var label = result[0].label;
                    var point = {
                        lat: result[0].geodata[0].lat,
                        lon: result[0].geodata[0].lon
                    };
                    //point pasa a ser points y contiene elementos cada uno con cuatro atributos: label, lat, lon y bbox
                    var geodata = {
                        ns: ns,
                        text: text,
                        label: label,
                        bbox: bbox,
                        point: point
                    };
                    console.log('Emitting ' + JSON.stringify(geodata));
                    io.sockets.emit(GEODATA_TOPIC, geodata);
                });
            }
        }, PERIOD);
    });
});

function nsToSec(ns) {
    return ns.split('_')[1];
}

function printArray(arr) {
    if ( typeof(arr) == "object") {
        for (var i = 0; i < arr.length; i++) {
            printArray(arr[i]);
        }
    }
    else console.log(arr);
}