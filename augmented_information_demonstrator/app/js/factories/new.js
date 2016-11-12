/**
 * Created by Moises Vilar on 16/10/2014.
 */

angular.module('app').factory('New', [function() {
    return function(url, title) {
        this.url = url;
        this.title = title;
    };
}]);