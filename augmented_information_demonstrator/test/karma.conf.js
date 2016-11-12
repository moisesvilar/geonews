/**
 * Created by Moises Vilar on 16/10/2014.
 */

module.exports = function(config){
    config.set({

        basePath : '../',

        files : [
            'app/bower_components/angular/angular.js',
            'test/unit/vendor/angular-mocks.js',
            'app/js/**/*.js',
            'test/unit/**/*.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};