/**
 * Created by Moises Vilar on 19/11/2014.
 */

angular.module('app').factory('GeometricUtils', [function () {

    function GeometricUtils(){
    }

    GeometricUtils.prototype.getIntersectionArea = function(bbox1, bbox2) {
        if (bbox1.length == 0) return 0;
        if (bbox2.length == 0) return 0;
        p1 = getPolygon(bbox1);
        p2 = getPolygon(bbox2);
        return p1.intersection(p2).getArea();
    };

    GeometricUtils.prototype.getArea = function(bbox) {
        if (bbox.length == 0) return 0;
        p = getPolygon(bbox);
        return p.getArea();
    };

    var POLYGON_TEMPLATE = 'POLYGON(({0,0}, {0,1}, {1,0}, {1,1}, {0,0}))';
    var reader = new jsts.io.WKTReader();

    function getPolygon(bbox) {
        if (bbox.length == 2) {
            bbox = [[bbox[0][0], bbox[0][1]], [bbox[0][0], bbox[1][1]], [bbox[1][0], bbox[1][1]], [bbox[1][0], bbox[0][1]]];
        }
        var polStr = POLYGON_TEMPLATE
            .replace('{0,0}', bbox[0][0] + ' ' + bbox[0][1])
            .replace('{0,1}', bbox[1][0] + ' ' + bbox[1][1])
            .replace('{1,0}', bbox[2][0] + ' ' + bbox[2][1])
            .replace('{1,1}', bbox[3][0] + ' ' + bbox[3][1])
            .replace('{0,0}', bbox[0][0] + ' ' + bbox[0][1]);
        return reader.read(polStr);
    }

    return new GeometricUtils();
}]);