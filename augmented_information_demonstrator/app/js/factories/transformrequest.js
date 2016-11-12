/**
 * Created by Moises Vilar on 28/10/2014.
 */

angular.module('app').factory('TransformRequest', [function() {
    return function(obj) {
        var str = [];
        for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    };
}]);