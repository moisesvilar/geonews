/**
 * Created by Moises Vilar on 07/10/2014.
 */

var AbstractService = require('./AbstractService').AbstractService;

/**
 * Service for AdegaWS.
 * @constructor
 */
function AdegaService() {
    AbstractService.call(this);
}

AdegaService.HOST = 'tec.citius.usc.es';
AdegaService.PORT = '80';
AdegaService.ENTRY_POINT = '/adegaws2/ADEGA/';
AdegaService.DEFAULT_ONTOLOGY = 2;
AdegaService.DEFAULT_CORPUS = '';
AdegaService.DEFAULT_TERM_EXTRACTOR = 2;
AdegaService.DEFAULT_NUMBER_ELEMENTS_CONTEXT = '';
AdegaService.DEFAULT_ROOT_NODES_EXTRACTOR = 1;
AdegaService.DEFAULT_MAX_ROOT_NODES = '';

/**
 * AdegaService extends from AbstractService.
 * @type {AbstractService}
 */
AdegaService.prototype = new AbstractService();
AdegaService.prototype.constructor = AdegaService;

/**
 * The authorization key.
 * @type {string}
 * @private
 */
AdegaService.prototype.key = '';

/**
 * Request for authorization method.
 * @param email The email address.
 * @param callback The callback function.
 * @private
 */
AdegaService.prototype._authorization = function(email, callback) {
    var parameters = {
        email: email
    };
    var options = {
        host: AdegaService.HOST,
        port: AdegaService.PORT,
        path: AdegaService.ENTRY_POINT + 'authorization',
        method: 'GET'
    };
    this.get(options, parameters, function(err, body) {
        if (err) return callback(err);
        callback(null, body);
    });
};

/**
 * Request for context method.
 * @param key The authorization key. @required.
 * @param text Plain text to analyze. @required.
 * @param ontology ID of a specific ontology. Possible values: 1 = DBpedia (en); 2 = DBpedia (es); ; 3 = MeSH. @optional. @default 2.
 * @param corpus ID of corpus. Corpus is used to calculate IDF values for a term. If a value is not specified, then the index label is used as corpus. Possible values: 1 = DBpedia corpus (en); 2 = DBpedia corpus (es); 3 = MeSH (en). @optional. @default empty.
 * @param termExtractor ID of the term extractor. Possible values: 1 = Composite Term extractor for English text; 2 = Composite Term extractor for Spanish text. @optional. @default 2.
 * @param numberElementsContext Number of relevant terms of the context. If the number of elements is not specified, then all terms are returned. @optional. @default empty.
 * @param callback The callback function. @required.
 * @private
 */
AdegaService.prototype._context = function(key, text, ontology, corpus, termExtractor, numberElementsContext, callback) {
    if (ontology instanceof Function) {
        callback = ontology;
        ontology = undefined;
    }
    ontology = ontology || AdegaService.DEFAULT_ONTOLOGY;
    corpus = corpus || AdegaService.DEFAULT_CORPUS;
    termExtractor = termExtractor || AdegaService.DEFAULT_TERM_EXTRACTOR;
    numberElementsContext = numberElementsContext || AdegaService.DEFAULT_NUMBER_ELEMENTS_CONTEXT;
    var parameters = {
        text: text,
        idOntology: ontology,
        idCorpus: corpus,
        idTermExtractor: termExtractor,
        numberElementsContext: numberElementsContext
    };
    var options = {
        host: AdegaService.HOST,
        port: AdegaService.PORT,
        path: AdegaService.ENTRY_POINT + 'context',
        method: 'POST',
        headers: {
            "X-Auth-Key": key,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    this.post(options, parameters, function(err, body) {
        if (err) return callback(err);
        callback(null, JSON.parse(body));
    });
};

/**
 * Request for rootnodes method.
 * @param key The authorization key. @required.
 * @param context List of context terms used to search root nodes. Model Schema: TermWrapper JSON array object (output of context service). @required.
 * @param ontology ID of a specific ontology. Possible values: 1 = DBpedia (en); 2 = DBpedia (es); 3 = MeSH. @optional @default 2.
 * @param rootNodesExtractor ID of the root nodes extractor. Posible values: 1 = Simple RootNodes. @optional @default 1.
 * @param maxRootNodes Number of max root nodes. If the number is not specified, then root nodes for all context terms are returned. @optional @default empty.
 * @param callback The callback function. @required.
 * @private
 */
AdegaService.prototype._rootNodes = function(key, context, ontology, rootNodesExtractor, maxRootNodes, callback) {
    if (ontology instanceof Function) {
        callback = ontology;
        ontology = undefined;
    }
    ontology = ontology || AdegaService.DEFAULT_ONTOLOGY;
    rootNodesExtractor = rootNodesExtractor || AdegaService.DEFAULT_ROOT_NODES_EXTRACTOR;
    maxRootNodes = maxRootNodes || AdegaService.DEFAULT_MAX_ROOT_NODES;
    var parameters = {
        context: JSON.stringify(context),
        idOntology: ontology,
        idRootNodesExtractor: rootNodesExtractor,
        maxRootNodes: maxRootNodes
    };
    var options = {
        host: AdegaService.HOST,
        port: AdegaService.PORT,
        path: AdegaService.ENTRY_POINT + 'rootnodes',
        method: 'POST',
        headers: {
            "X-Auth-Key": key,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    this.post(options, parameters, function(err, body) {
        if (err) return callback(err);
        callback(null, JSON.parse(body));
    });
};

/**
 * Executes the context and rootnodes methods.
 * @param key The authorization key.
 * @param text The plain text to analyze.
 * @param callback The callback function.
 * @private
 */
AdegaService.prototype._process = function(key, text, callback) {
    var self = this;
    this._context(key, text, function(err, context) {
        if (err) return callback(err);
        self._rootNodes(key, context, function(err, nodes) {
            if (err) return callback(err);
            return callback(null, nodes);
        })
    });
};

/**
 * Request to AdegaWS for retrieving the relevant terms in text.
 * @param email The email address.
 * @param text The plain text to analyze.
 * @param callback The callback function. It takes two parameters: an error (or null) and an array of relevant terms.
 */
AdegaService.prototype.search = function(email, text, callback) {
    var self = this;
    if (!this.key) {
        this._authorization(email, function(err, key) {
            if (err) return callback(err);
            self.key = key;
            self._process(key, text, callback);
        })
    }
    else {
        self._process(this.key, text, callback);
    }
};

exports.AdegaService = new AdegaService();