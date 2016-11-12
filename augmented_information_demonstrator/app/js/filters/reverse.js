/**
 * Created by Moises Vilar on 20/10/2014.
 */

angular.module('app').filter('reverse', function() {
    return function(items) {
        if (!items) return;
        return items.slice().reverse();
    };
});