/**
 * Created by Moises Vilar on 15/10/2014.
 */

describe('Augmented information demonstrator main page', function() {

    beforeEach(function() {
        browser.get('app/index.html');
    });

    it('should have the right title', function() {
        expect(browser.getTitle()).toEqual('Augmented Information Demonstrator');
    });

    it('should show the news list', function() {
        var newList = element.all(by.repeater('new in news'));
        expect(newList.count()).toBe(77);
    });
});