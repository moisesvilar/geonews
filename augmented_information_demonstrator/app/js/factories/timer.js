/**
 * Created by Moises Vilar on 15/10/2014.
 */

angular.module('app').factory('Timer', ['$timeout', '$interval', function ($timeout, $interval) {

    function Timer(){
        this.delay = Timer.DELAY;
        this.period = Timer.PERIOD;
        this.callback = undefined;
        this.timer = undefined;
    }

    Timer.DELAY = 0;
    Timer.PERIOD = 1000;

    Timer.prototype.start = function (delay, period, callback) {
        this.delay = delay || this.delay;
        this.period = period || this.period;
        this.callback = callback || this.callback;
        if (this.delay == 0) this.delay = 1;
        if (this.timer) this.stop();
        var self = this;
        $timeout(function () {
            self.timer = $interval(self.callback, self.period);
        }, this.delay);
    };

    Timer.prototype.stop = function () {
        if (!this.timer) return;
        $interval.cancel(this.timer);
        this.timer = undefined;
    };

    Timer.prototype.pause = function () {
        this.stop();
    };

    Timer.prototype.restart = function (delay, period, callback) {
        if (this.timer) this.stop();
        this.start(delay, period, callback);
    };

    return Timer;
}]);