/**
 * Created by Moises Vilar on 10/10/2014.
 */

var async = require('async');

function AugmentedInformationService(){
}

AugmentedInformationService.ADEGAWS_USERNAME = 'moises.vilar@usc.es';
AugmentedInformationService.GEONAMES_USERNAME = 'moises.vilar@usc.es';
AugmentedInformationService.DEFAULT_OPTIONS = {
    terms_extractor: 'adega',
    geocoding: 'geonames'
};

AugmentedInformationService.prototype.AdegaService = require('./AdegaService').AdegaService;
AugmentedInformationService.prototype.StanfordNlpService = require('./StanfordNlpService').StanfordNlpService;
AugmentedInformationService.prototype.WikipediaService = require('./WikipediaService').WikipediaService;
AugmentedInformationService.prototype.MappingService = require('./MappingService').MappingService;
AugmentedInformationService.prototype.GeonamesService = require('./GeonamesService').GeonamesService;
AugmentedInformationService.prototype.NominatimService = require('./NominatimService').NominatimService;
AugmentedInformationService.prototype.BoundingBoxService = require('./BoundingBoxService').BoundingBoxService;

AugmentedInformationService.prototype.search = function(entry, options, callback) {
    if (options instanceof Function) {
        callback = options;
        options = undefined;
    }
    options = options || AugmentedInformationService.DEFAULT_OPTIONS;
    if (typeof entry == 'string') {
        entry = new Text(0, entry, 'es');
    }
    if (entry instanceof Array) {
        this._processArray(entry, options, callback);
    }
    else if (typeof entry == 'object') {
        this._processEntry(entry, options, callback);
    }
    else return callback('Type of entry not supported');
};

AugmentedInformationService.prototype._processArray = function(entries, options, callback) {
    var self = this;
    var tasks = [];
    entries.forEach(function(entry) {
        tasks.push(function(entryCallback) {
            self._processEntry(entry, options, entryCallback);
        });
    });
    async.parallel(tasks, function(err, results) {
        if (err) return callback(err);
        var transformedResult = {};
        results.forEach(function(terms) {
            if (!terms) return;
            terms.forEach(function(term) {
                if (!transformedResult[term.ns]) transformedResult[term.ns] = [];
                transformedResult[term.ns].push(term);
            });
        });
        callback(null, transformedResult);
    });
};

AugmentedInformationService.prototype._processEntry = function(entry, options, callback) {
    if (options.terms_extractor === 'adega') {
        this._processEntryAdega(entry, options, callback);
    }
    else if (options.terms_extractor === 'stanford') {
        this._processEntryStanford(entry, options, callback);
    }
    else return callback('Terms extractor not supported');
};

AugmentedInformationService.prototype._processEntryAdega = function(entry, options, callback) {
    var self = this;
    this.AdegaService.search(AugmentedInformationService.ADEGAWS_USERNAME, entry.text, function(err, terms) {
        if (err) return callback(err);
        self._processTerms(terms, entry, options, callback);
    });
};

AugmentedInformationService.prototype._processEntryStanford = function(entry, options, callback) {
    var self = this;
    this.StanfordNlpService.search(entry.text, function(err, terms) {
        if (err) return callback(err);
        self._processTerms(terms, entry, options, callback);
    });
};

AugmentedInformationService.prototype._processTerms = function(terms, entry, options, callback) {
    if (!terms || terms.length == 0) return callback(null, undefined);
    var tasks = [];
    var self = this;
    terms.forEach(function(term) {
        tasks.push(function(termCallback) {
            self._processTerm(term, entry, options, termCallback);
        });
    });
    async.parallel(tasks, function(err, results) {
        if (err) return callback(err);
        async.filter(results, function(item, cb){ return cb(item); }, function(filteredResults) {
            callback(null, filteredResults);
        });
    });
};

AugmentedInformationService.prototype._processTerm = function(term, entry, options, callback) {
    if (options.terms_extractor === 'adega') {
        this._processTermAdega(term, entry, options, callback);
    }
    else if (options.terms_extractor === 'stanford') {
        this._processTermStanford(term, entry, options, callback);
    }
    else return callback('Terms extractor not supported');
};

AugmentedInformationService.prototype._processTermAdega = function(term, entry, options, callback) {
    var title = this._getTitleFromResource(term.resource);
    var self = this;
    this.WikipediaService.queryLangLinks(title, function(err, wikipediaUrl) {
        if (err) return callback(err);
        if (!wikipediaUrl) return callback(null, undefined);
        var dbpediaUrl = self._getDbpediaUrlFromWikipediaUrl(wikipediaUrl);
        self.MappingService.isPlace(dbpediaUrl, function(err, isPlace) {
            if (!isPlace) return callback(null, undefined);
            if (options.geocoding === 'geonames') {
                self._processTermGeonames(term, entry, options, callback);
            }
            else if (options.geocoding === 'openstreetmaps') {
                self._processTermOpenstreetmaps(term, entry, options, callback);
            }
            else return callback('Geocoding service not supported');
        });
    });
};

AugmentedInformationService.prototype._processTermStanford = function(term, entry, options, callback) {
    if (options.geocoding === 'geonames') {
        this._processTermGeonames(term, entry, options, callback);
    }
    else if (options.geocoding === 'openstreetmaps') {
        this._processTermOpenstreetmaps(term, entry, options, callback);
    }
    else return callback('Geocoding service not supported');
};

AugmentedInformationService.prototype._processTermGeonames = function(term, entry, options, callback) {
    var self = this;
    this.GeonamesService.search(AugmentedInformationService.GEONAMES_USERNAME, term.label?term.label : term, function(err, geocodingResult) {
        if (err) return callback(err);
        var tasks = [];
        geocodingResult.geonames.forEach(function(geocoding) {
            tasks.push(function(geocodingCallback) {
                self._getBoundingBox(term, geocoding, options, geocodingCallback);
            });
        });
        async.parallel(tasks, function(err, results) {
            if (err) return callback(err);
            var result = {
                ns: entry.ns,
                text: entry.text,
                label: term.label ? term.label : term,
                geodata: results
            };
            callback(null, result);
        });
    });
};

AugmentedInformationService.prototype._processTermOpenstreetmaps = function(term, entry, options, callback) {
    var self = this;
    this.NominatimService.search(term, function(err, geocodingResult) {
        if (err) return callback(err);
        var tasks = [];
        geocodingResult.forEach(function(geocoding) {
            tasks.push(function(geocodingCallback) {
                self._getBoundingBox(term, geocoding, options, geocodingCallback);
            });
        });
        async.parallel(tasks, function(err, results) {
            if (err) return callback(err);
            var result = {
                ns: entry.ns,
                text: entry.text,
                label: term.label ? term.label : term,
                geodata: results
            };
            callback(null, result);
        });
    });
};

AugmentedInformationService.prototype._getBoundingBox = function(term, geocoding, options, callback) {
    var name = '';
    var country = '';
    var admin = '';
    var lat = 0.0;
    var lon = 0.0;
    if (options.geocoding === 'geonames') {
        name = geocoding.name;
        country = geocoding.countryName;
        admin = geocoding.adminName1;
        lat = parseFloat(geocoding.lat);
        lon = parseFloat(geocoding.lng);
    }
    else if (options.geocoding === 'openstreetmaps') {
        name = geocoding.display_name ? geocoding.display_name : '';
        country = geocoding.address.country ? geocoding.address.country : '';
        admin = geocoding.address.state ? geocoding.address.state : '';
        lat = parseFloat(geocoding.lat);
        lon = parseFloat(geocoding.lon);
    }
    else return callback('Geocoding service not supported');

    term = options.terms_extractor == 'stanford' ? term : term.label;
    this.BoundingBoxService.get(lat, lon, term, options, function(err, bboxResult) {
        if (err) return callback(err);
        var wkrname = bboxResult.name;
        var wkrbbox = bboxResult.wkbbox;
        var bbox = bboxResult.bbox;
        var geodata = new Geodata(name, country, admin, lat, lon, bbox, wkrname, wkrbbox);
        callback(null, geodata);
    });
};

AugmentedInformationService.prototype._getTitleFromResource = function(resource) {
    if (!resource) return '';
    var tokens = resource.split('/');
    if (!tokens) return '';
    return tokens[tokens.length - 1];
};

AugmentedInformationService.prototype._getDbpediaUrlFromWikipediaUrl = function(wikipediaUrl) {
    var tokens = wikipediaUrl.split('/');
    var resource = tokens[tokens.length - 1];
    return 'http://dbpedia.org/resource/' + resource;
};

function Geodata(name, country, admin, lat, lon, bbox, wkrname, wkrbbox) {
    this.name = name;
    this.country = country;
    this.admin = admin;
    this.lat = lat;
    this.lon = lon;
    this.bbox = bbox;
    this.wkregion = {
        name: wkrname,
        bbox: wkrbbox
    };
}

function Text(ns, text) {
    this.ns = ns;
    this.text = text;
}

exports.AugmentedInformationService = new AugmentedInformationService();
exports.Geodata = Geodata;
exports.Text = Text;