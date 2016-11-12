/**
 * Created by Moises Vilar on 18/11/2014.
 */

angular.module('app').filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
});