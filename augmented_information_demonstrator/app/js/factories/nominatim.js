/**
 * Created by Moises Vilar on 27/10/2014.
 */

angular.module('app').factory('Nominatim', ['$q', '$http', function($q, $http) {

    function NominatimService(){

    }

    NominatimService.URL = 'http://nominatim.openstreetmap.org/search';

    NominatimService.prototype.search = function(query) {
        var deferred = $q.defer();
        $http({
            url: NominatimService.URL,
            method: 'GET',
            params: {
                q: query,
                addressdetails: 1,
                format: 'json'
            }
        }).success(function(data) {
            var result = [];
            data.forEach(function(item) {
                result.push({
                    name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                    boundingbox: item.boundingbox
                });
            });
            deferred.resolve(result);
        });
        return deferred.promise;
    };

    return new NominatimService();

}]);