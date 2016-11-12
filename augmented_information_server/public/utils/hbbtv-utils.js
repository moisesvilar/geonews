/**
 * Created by ctdesk241 on 17/09/2014.
 */

/**
 * Initializes the HbbTV application.
 * @param error The error callback.
 */
function initHbbtv (error) {
    if (hbbtvlib_initialize()) {
        if (hbbtvlib_show()) {

        } else if (error){
            error('Error showing HbbTV app: ' + hbbtvlib_lastError);
        } else {
            throw new Error('Error showing HbbTV app: ' + hbbtvlib_lastError);
        }

    } else if (error) {
        error('Error initializing HbbTV app: ' + hbbtvlib_lastError);
    } else {
        throw new Error('Error initializing HbbTV app: ' + hbbtvlib_lastError);
    }
}

/**
 * Default visibility timeout.
 */
var VISIBILITY_TIMEOUT = 5000;

/**
 * Sets the time out until which the app is hidden.
 * @param timeout The timeout.
 */
function setRedButtonTimeout(timeout) {
    if (!timeout) timeout = VISIBILITY_TIMEOUT;
    window.setTimeout(
        function() {
            hbbtvlib_hide();
        },
        timeout
    );
}

var APP = 'views/main.html';

/**
 * Event handler for creating the application pushing the red button.
 * Creates the application.
 * @param e the event
 */
function redButtonCreateAppEventHandler(e) {
    switch (e.keyCode) {
        case VK_RED:
            hbbtvlib_createApp(APP);
            break;
    }
}

/**
 * Event handler for hiding the application pushing the red button.
 * Hides the application.
 * @param e the event
 */
function redButtonHideAppEventHandler(e) {
    switch (e.keyCode) {
        case VK_RED:
            hbbtvlib_hide();
            break;
    }
}

/**
 * Event handler for toggling the application pushing the red button.
 * @param e
 */
function redButtonToggleAppEventHandler(e) {
    switch (e.keyCode) {
        case VK_RED:
            if (isShow) {
                unsetBroadcastVideo();
                hbbtvlib_hide();
            } else {
                setBroadcastVideo();
                hbbtvlib_show();
            }
            break;
    }
}

/**
 * Sets the broadcast video in the right element of the HTML page.
 */
function setBroadcastVideo() {
    try {
        var broadcast_video = document.getElementById("video");
        broadcast_video.setFullScreen(false);
        broadcast_video.bindToCurrentChannel();
    } catch (e) {
        console.log('setting broadcast video ' + e);
    }
}

function unsetBroadcastVideo() {
    try {
        var broadcast_video = document.getElementById("video");
        broadcast_video.setFullScreen(true);
        broadcast_video.release();
    } catch (e) {
        console.log('setting broadcast video ' + e);
    }
}