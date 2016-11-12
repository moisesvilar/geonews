/**
 * Created by Moises Vilar on 23/10/2014.
 */

angular.module('app').factory('SubtitlesGeodata', ['$http', '$resource', 'TransformRequest', function($http, $resource, TransformRequest) {

    //var URL = 'http://cthda02.usc.es:8080/subtitles/:id/:ns';
    var URL = 'http://localhost:8080/subtitles/:id/:ns';
    //var URL = 'http://cthda02.usc.es:8080/subtitles/:id/:ns';
    var OPTIONS =  {
        transformRequest: TransformRequest,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };

    var SubtitlesGeodata = $resource(
        URL,
        {id: '@id', ns: '@ns'},
        {update: {method: 'PUT'}}
    );

    SubtitlesGeodata.prototype.subtitles = {};

    SubtitlesGeodata.updateGeodata = function(id, ns, geodata) {
        id = id.split('/').join('_').split(':').join('_');
        var url = URL.replace(':id', id).replace(':ns', ns);
        geodata = JSON.stringify(geodata);
        return $http.put(url, {geodata: geodata}, OPTIONS);
    };

    SubtitlesGeodata.updateState = function(id, state) {
        id = id.split('/').join('_').split(':').join('_');
        var url = URL.replace(':id', id).replace(':ns', '');
        state = JSON.stringify(state);
        return $http.put(url, {state: state}, OPTIONS);
    };

    return SubtitlesGeodata;
}]);