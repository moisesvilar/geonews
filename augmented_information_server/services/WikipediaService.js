/**
 * Created by Moises Vilar on 09/10/2014.
 */

var AbstractService = require('./AbstractService').AbstractService;

/**
 * Service for Wikipedia API.
 * @constructor
 */
function WikipediaService(){
    AbstractService.call(this);
}

WikipediaService.HOST = 'es.wikipedia.org';
WikipediaService.PORT = '80';
WikipediaService.ENTRY_POINT = '/w/api.php';
WikipediaService.DEFAULT_LANG = 'en';

/**
 * WikipediaService extends from AbstractService.
 * @type {AbstractService}
 */
WikipediaService.prototype = new AbstractService();
WikipediaService.prototype.constructor = WikipediaService;

/**
 * Retrieves the language links for a given title in Spanish Wikipedia.
 * @param title The page's title. @required.
 * @param lang ISO 639-1 language code. @optional. @default en.
 * @param parameters The parameters for the query string. @optional.
 * @param callback The callback function. It takes two parameters: an error (or null) and the language link or empty if not found.
 */
WikipediaService.prototype.queryLangLinks = function(title, lang, parameters, callback) {
    if (lang instanceof Function) {
        callback = lang;
        lang = undefined;
    }
    else if (parameters instanceof Function) {
        callback = parameters;
        parameters = undefined;
    }
    if (!lang) lang = WikipediaService.DEFAULT_LANG;
    if (!parameters) {
        parameters = {
            action: 'query',
            titles: title,
            format: 'json',
            prop: 'langlinks',
            redirects: '',
            llprop: 'url',
            continue: ''
        };
    }
    var options = {
        host: WikipediaService.HOST,
        port: WikipediaService.PORT,
        path: WikipediaService.ENTRY_POINT,
        method: 'GET'
    };
    var self = this;
    this.get(options, parameters, function(err, data) {
        if (err) return callback(err);
        data = JSON.parse(data);
        self._process(data, title, lang, parameters, callback);
    });
};

/**
 * Process the data retrieved by Wikipedia API in a recursive fashion in order to find the link for the specified language.
 * @param data Data retrieved by the Wikipedia API.
 * @param title Title of the page from which we want its link.
 * @param lang ISO 639-1 language code.
 * @param parameters JSON object which contains the parameters for the HTTP request.
 * @param callback Function callback.
 * @private
 */
WikipediaService.prototype._process = function(data, title, lang, parameters, callback) {
    if (!data || !data.query || !data.query.pages) return callback(null, '');
    for (var prop in data.query.pages) {
        if (!data.query.pages[prop].langlinks || data.query.pages[prop].langlinks.length == 0) return callback(null, '');
        var url = '';
        data.query.pages[prop].langlinks.forEach(function(entry) {
            if (entry.lang == lang) {
                url = entry.url;
            }
        });
        if (!url) {
            if (!data.continue) return callback(null, '');
            for (prop in data.continue) {
                parameters[prop] = data.continue[prop];
            }
            this.queryLangLinks(title, lang, parameters, callback);
        }
        else {
            return callback(null, url);
        }
    }
};

exports.WikipediaService = new WikipediaService();