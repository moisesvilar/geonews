/**
 * Created by Moises Vilar on 16/10/2014.
 */

angular.module('app').factory('AugmentedInformation', ['$http', function($http) {

    var callback = undefined;

    function AugmentedInformationService(){
        this.clustering = AugmentedInformationService.CLUSTERING;
        this.accSubtitles = undefined;
        this.terms_extractor = AugmentedInformationService.TERMS_EXTRACTOR;
        this.geocoding = AugmentedInformationService.GEOCODING;
    }

    AugmentedInformationService.URL = 'http://localhost:8080/ai';
    //AugmentedInformationService.URL = 'http://cthda02.usc.es:8080/ai';
    AugmentedInformationService.CLUSTERING = 1;
    AugmentedInformationService.TERMS_EXTRACTOR = 'adega';
    AugmentedInformationService.GEOCODING = 'geonames';
    AugmentedInformationService.GET_BOUNDING_BOX= {
        type: 'perimeter'
    };

    AugmentedInformationService.prototype.start = function(clustering, terms_extractor, geocoding, getBoundingBox, cb) {
        this.clustering = clustering || AugmentedInformationService.CLUSTERING;
        this.terms_extractor = terms_extractor || AugmentedInformationService.TERMS_EXTRACTOR;
        this.geocoding = geocoding || AugmentedInformationService.GEOCODING;
        this.getBoundingBox = getBoundingBox || AugmentedInformationService.GET_BOUNDING_BOX;
        this.accSubtitles = undefined;
        callback = cb;
    };

    AugmentedInformationService.prototype.stop = function() {
        this.clustering = AugmentedInformationService.CLUSTERING;
        this.accSubtitles = undefined;
        callback = undefined;
    };

    AugmentedInformationService.prototype.setClustering = function(clustering) {
        this.clustering = clustering;
    };

    AugmentedInformationService.prototype.setTermsExtractor = function(terms_extractor) {
        this.terms_extractor = terms_extractor;
    };

    AugmentedInformationService.prototype.setGeocoding = function(geocoding) {
        this.geocoding = geocoding;
    };

    AugmentedInformationService.prototype.setGetBoundingBox = function(getBoundingBox) {
        this.getBoundingBox = getBoundingBox;
    };

    AugmentedInformationService.prototype.add = function(subtitle, getBoundingBox) {
        if (!this.accSubtitles) {
            this.accSubtitles = {
                ns: subtitle.ns,
                text: []
            }
        }
        this.accSubtitles.text.push(subtitle.text);
        if (this.accSubtitles.text.length == this.clustering) {
            this.accSubtitles.text = this.accSubtitles.text.join(' ');
            var options = {};
            options.terms_extractor = this.terms_extractor;
            options.geocoding = this.geocoding;
            options.getBoundingBox = getBoundingBox || this.getBoundingBox;
            this.search(this.accSubtitles, options).success(callback);
            this.accSubtitles = undefined;
        }
    };

    AugmentedInformationService.prototype.search = function(data, options) {
        options = options || {};
        options.terms_extractor = options.terms_extractor || this.terms_extractor;
        options.geocoding = options.geocoding || this.geocoding;
        options.getBoundingBox = options.getBoundingBox || this.getBoundingBox;
        return $http({
            url: AugmentedInformationService.URL,
            method: 'POST',
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {
                entry: JSON.stringify(data),
                options: JSON.stringify(options)
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    };

    return AugmentedInformationService;
}]);