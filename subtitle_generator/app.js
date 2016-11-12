/**
 * Created by Moises Vilar on 14/10/2014.
 */

var urlsFile = 'urls.txt';
var outputDir = 'output';

var Downloader = require('./lib/Downloader').Downloader;
var cheerio = require('cheerio');
var fs = require('fs');
var lr = new (require('line-by-line'))(urlsFile);

try {
    fs.mkdirSync(outputDir);
} catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
}

lr.on('error', function(err) {
   console.error(err);
});

lr.on('line', function(url) {
    console.log('Downloading URL ' + url);
    Downloader.download(url, function(err, html) {
        console.log('Processing URL ' + url);
        if (err) return console.error(err);
        var $ = cheerio.load(html);
        var subtitles = [];
        $('#transcripcion .textoTranscripcion').each(function(index, item) {
            var id = $(item).attr('id');
            var text = $(item).children('a').text();
            text = text.split('\r').join('');
            text = text.split('\n').join(' ');
            text = text.trim();
            var subtitle = {
                ns: id,
                text: text
            };
            subtitles.push(subtitle);
        });
        if (subtitles.length == 0) {
            console.log('No subtitles in ' + url);
            return;
        }
        var filename = url + '.json';
        filename = filename.split('/').join('_');
        filename = filename.split(':').join('_');
        console.log('Creating file ' + filename);
        var subtitleObject = {
            url: url,
            subtitles: subtitles
        };
        fs.writeFile(outputDir + '/' + filename, JSON.stringify(subtitleObject), 'utf8', function(err) {
            if (err) return console.log(err);
            console.log('URL ' + url + ' processed');
        });
    });
});

lr.on('end', function() {
    console.log('URLs file processing is finished.');
});
