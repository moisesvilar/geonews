/**
 * Created by Moises Vilar on 18/11/2014.
 */

angular.module('app').filter('bboxMethodToString', function() {
    return function(method) {
        switch(method) {
            case 'perimeter':
                return 'Por perímetro';
            case 'area':
                return 'Por área';
            case 'distance_perimeter':
                return 'Por distancia y perímetro';
            case 'distance_area':
                return 'Por distancia y área';
            case 'aspect_perimeter':
                return 'Por aspecto y perímetro';
            case 'aspect_area':
                return 'Por aspecto y área';
            case '':
                return '';
            default:
                return 'Por aspecto y área';
        };
    };
});