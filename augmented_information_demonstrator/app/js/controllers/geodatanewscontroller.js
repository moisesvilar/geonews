/**
 * Created by Moises Vilar on 23/10/2014.
 */

angular.module('app').controller('geodatanewscontroller', [
    '$scope',
    'SubtitlesGeodata',
    function($scope, SubtitlesGeodata) {

        var NONE_IMAGE_PATH = '';
        var PARTIALLY_IMAGE_PATH = 'resources/images/circle.png';
        var COMPLETED_IMAGE_PATH = 'resources/images/check.png';

        $scope.news = SubtitlesGeodata.query();

        $scope.getIconForNew = function(_new) {
            switch(_new.state) {
                case 0: return NONE_IMAGE_PATH;
                case 1: return PARTIALLY_IMAGE_PATH;
                case 2: return COMPLETED_IMAGE_PATH;
                default: return NONE_IMAGE_PATH;
            }
        };
    }
]);