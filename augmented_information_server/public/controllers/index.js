/**
 * Created by ctdesk241 on 17/09/2014.
 */
/**
 * Controller for index view.
 * @constructor
 */
function IndexController() {
    initHbbtv();
    setRedButtonTimeout();
    window.onkeydown = redButtonCreateAppEventHandler;
}

