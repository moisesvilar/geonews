/**
 * Created by Moises Vilar on 07/10/2014.
 */

require('jasmine-expect');

var AdegaService = require('../services/AdegaService').AdegaService;
var email = 'moises.vilar.test@usc.es';

describe ('authorization', function() {

    it ('should bring an authorization key', function(done) {
        AdegaService._authorization(email, function(err, key) {
            expect(err).toBeFalsy();
            expect(key).toBeString();
            done();
        })
    });

});

describe('adegaws', function() {

    var key = 'lcdkddtb2h6h0fnvdmmiims2bj';
    var text = 'Han pasado tres dias en Mariupol';
    var context = [
        {
            "term":"tres dias",
            "uri":"http://es.dbpedia.org/resource/Tres_días",
            "relevance":8.112991,
            "synonyms":["Tres días"]
        },
        {
            "term":"mariupol",
            "uri":"http://es.dbpedia.org/resource/Mariupol",
            "relevance":7.926898,
            "synonyms":["Mariupol"]
        },
        {
            "term":"dias",
            "uri":"http://es.dbpedia.org/resource/Día",
            "relevance":5.7657776,
            "synonyms":["Día"]
        }
    ];

    it('should obtain a set of relevant terms from a text', function(done) {
        AdegaService._context(key, text, function(err, context) {
            expect(err).toBeFalsy();
            expect(context).toBeArray();
            expect(context).toBeArrayOfObjects();
            context.forEach(function(object) {
                expect(object.term).toBeDefined();
                expect(object.uri).toBeDefined();
                expect(object.relevance).toBeDefined();
                expect(object.synonyms).toBeArray();
                expect(object.synonyms).toBeArrayOfStrings();
            });
            done();
        });
    });

    it('should obtain a set of root nodes from ontology graph using context term to start searching related nodes', function(done){
        AdegaService._rootNodes(key, context, function(err, nodes) {
            expect(err).toBeFalsy();
            expect(nodes).toBeArray();
            expect(nodes).toBeArrayOfObjects();
            nodes.forEach(function(object) {
                expect(object.id).toBeDefined();
                expect(object.label).toBeDefined();
                expect(object.resource).toBeDefined();
                expect(object.isCategory).toBeBoolean();
            });
            done();
        });
    });
});

describe('adega service', function() {
    var key = 'lcdkddtb2h6h0fnvdmmiims2bj';
    var text = 'Han pasado tres dias en Mariupol';

    it('should process both rootNodes and context methods', function(done) {
        AdegaService._process(key, text, function(err, nodes) {
            expect(err).toBeFalsy();
            expect(nodes).toBeArray();
            expect(nodes).toBeArrayOfObjects();
            nodes.forEach(function(object) {
                expect(object.id).toBeDefined();
                expect(object.label).toBeDefined();
                expect(object.resource).toBeDefined();
                expect(object.isCategory).toBeBoolean();
            });
            done();
        });
    });

    it('should find the relevant terms from a text', function(done) {
        AdegaService.search(email, text, function(err, nodes) {
            expect(err).toBeFalsy();
            expect(nodes).toBeArray();
            expect(nodes).toBeArrayOfObjects();
            nodes.forEach(function(object) {
                expect(object.id).toBeDefined();
                expect(object.label).toBeDefined();
                expect(object.resource).toBeDefined();
                expect(object.isCategory).toBeBoolean();
            });
            done();
        });
    });
});