/**
 * Created by Moises Vilar on 23/10/2014.
 */

angular.module('app').controller('newscontroller', [
    '$scope',
    'Urls',
    'New',
    function($scope, Urls, New) {
        $scope.news = Urls.map(function(item){
            return new New(item, item.split('/')[item.split('/').length-3]);
        });
    }
]);