/**
 * Created by Moises Vilar on 21/10/2014.
 */

require('string.prototype.endswith');

function StanfordNlpService(){
}

StanfordNlpService.PORT = 2121;

StanfordNlpService.prototype.search = function(text, callback) {
    var client = require('net').Socket();
    client.connect(StanfordNlpService.PORT, 'localhost', function () {
        client.write(text);
        client.end();
    });
    client.on('close', function() {
        client.destroy();
    });
    client.on('error', function(e){
        callback(e);
    });
    var self = this;
    var result = [];
    client.on('data', function(data) {
        data = data.toString();
        var tokens = data.split(' ');
        var item = '';
        for (var i=0; i<tokens.length; i++) {
            var token = tokens[i];
            if (token.match(/\/LUG$/)) {
                item += token.replace(/\/LUG$/, '')+ ' ';
            }
            else if(item && self._mayBeJoined(token)) {
                item += token.replace(/\/[A-Z]+[A-Z]$/, '').replace('/O', '') + ' ';
            }
            else if (item) {
                result.push(item.trim());
                item = '';
            }
        }
        return callback(null, result);
    });
};

StanfordNlpService.prototype._mayBeJoined = function(text) {
    if (text == 'de/O') return true;
    else if (text == 'del/O') return true;
    else if (text == 'la/O') return true;
    else return text.match(/\/[A-Z]+[A-Z]$/);
};

exports.StanfordNlpService = new StanfordNlpService();