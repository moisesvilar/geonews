/**
 * Created by Moises Vilar on 28/10/2014.
 */

angular.module('app').factory('Geodata', [function() {
    function Geodata(obj) {
        for (prop in obj) {
            this[prop] = obj[prop];
        }
    }

    return Geodata;
}]);