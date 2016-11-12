var FILE_NAME = 'instance_types_en.nt';

var MongoClient = require('mongodb').MongoClient;
var LineByLineReader = require('line-by-line');
var lr = new LineByLineReader(FILE_NAME);

MongoClient.connect('mongodb://localhost/dbpedia', function(err, db) {
	if (err) throw err;
	
	var collection = db.collection('mappings');
	var document = {};
	var count = 0;
	
	lr.on('error', function(err) {
		console.error(err);
		db.close();
	});
	
	lr.on('line', function(line) {
		var tokens = line.split(' ');
		if (tokens.length != 4 || tokens[3] != '.') {
			console.log('Bad line format: %s', line);
			return;
		}
		document.url = tokens[0];
		document.type = tokens[2];
		collection.update({_id: document.url}, {$addToSet: {types: document.type}}, {upsert: true}, function(err, ndocs) {
			console.log('Updated %s document with type %s', document.url, document.type);
			count += ndocs;
		});
	});
	
	lr.on('end', function(){
		console.log('Ended. %i documents inserted', count);
		db.close();
	});
});