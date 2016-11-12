/**
 * Created by Moises Vilar on 15/10/2014.
 */
describe('Timer', function () {

    var $interval;
    var $timeout;
    var Timer;

    beforeEach(module('app'));

    beforeEach(inject(function (_$interval_, _$timeout_, _Timer_) {
        $interval = _$interval_;
        $timeout = _$timeout_;
        Timer = _Timer_;
    }));

    it('should count three times', function () {
        var count = 0;

        function callback() {
            count++;
        }

        Timer.start(0, 1000, callback);
        $timeout.flush();
        $interval.flush(3000);
        expect(count).toEqual(3);
    });

    it('should count three times, stop, and count three times again', function () {
        var count = 0;

        function callback() {
            count++;
        }

        Timer.start(0, 1000, callback);
        $timeout.flush();
        $interval.flush(3000);
        Timer.pause();
        expect(count).toEqual(3);
        Timer.restart(0, 2000, callback);
        $timeout.flush();
        $interval.flush(6000);
        expect(count).toEqual(6);
    });
});