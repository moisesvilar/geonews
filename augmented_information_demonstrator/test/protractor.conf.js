/**
 * Created by Moises Vilar on 15/10/2014.
 */

exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/*.spec.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    chromeOnly: true,

    baseUrl: 'http://localhost:8000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
}