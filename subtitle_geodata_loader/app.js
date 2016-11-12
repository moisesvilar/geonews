var MongoClient = require('mongodb').MongoClient;
var jf = require('jsonfile');
var fs = require("fs");
var path = require("path");
var util = require('util');

MongoClient.connect("mongodb://cthda02.usc.es:9160/augmented_information", function(err, db) {
	if(err) throw err;
	var p = './subtitles';
	fs.readdir(p, function (err, files) {
		if (err) throw err;
		files.map(function (file) {
			return path.join(p, file);
		}).filter(function (file) {
			return fs.statSync(file).isFile();
		}).forEach(function (file) {
			jf.readFile(file, function(err, obj) {
				var url = obj.url;
				var id = url.split('/').join('_').split(':').join('_');
				var title = url.split('/')[url.split('/').length-3];
				var subtitles = obj.subtitles;
				subtitles.map(function(subtitle) {
					subtitle.geodata = {
						boundingbox: []
					};
					return subtitle;
				});
				db.collection('subtitles').update(
					{_id: id}, 
					{
						url: url,
						subtitles: obj.subtitles,
						state: 0,
						title: title,
					}, 
					{upsert: true}, 
					function(err, count) {
						if (err) throw err;
						if (!count) console.error('Not updated documents');
						else if (count > 1) console.error('Updated more than one document (%d)', count);
						else console.log('Successfully update');
					}
				);
			});
		});
	})
});