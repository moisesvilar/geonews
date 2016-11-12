/**
 * Created by Moises Vilar on 17/10/2014.
 */

angular.module('app').factory('Subtitles', ['$http', '$q', function($http, $q) {

    function Subtitles(){
    }

    Subtitles.PATH = 'resources/subtitles/';

    Subtitles.prototype.get = function(filename, path) {
        path = path || Subtitles.PATH;
        return $http.get(path + filename);
    };

    return new Subtitles();
}]);