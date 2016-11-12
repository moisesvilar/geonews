/**
 * HbbTV library v2.0, August 2013
 *
 * Overview:
 *
 * You need to add the OIPF application manager and the OIPF configuration
 * embedded object to your HTML DOM tree e.g.:
 *
 * Note: if you use "display: none;" for an embedded object some Browser will not
 * instantiate it.
 *
 * Note: the configuration object is needed for legacy devices that have been introduced
 * before HbbTVv1 has been published.
 *
<div style="visibility: hidden; width: 0; height: 0; position: absolute;">
<object type="application/oipfApplicationManager" id="oipfAppMan"> </object>
<object type="application/oipfConfiguration" id="oipfConfig"> </object>
</div>
 *
 * Before using any other function call the initializer first.
 *
 * function hbbtvlib_intialize()
 *   Creates and initializes HbbTV, i.e. OIPF DAE, embedded objects.
 *   Always call this function prior to other functions of this library.
 *
 * function hbbtvlib_show()
 *   Shows the application and requests keys via the keyset object.
 *
 * function hbbtvlib_hide()
 *   Hides the application and releases keys via the keyset object except for the red button.
 *
 * function hbbtvlib_setKeysets()
 *   Overrides the default keysets for the application being visible and hidden. (see also show and hide)
 *
 * function hbbtvlib_createApp()
 *   Creates a new application with the OIPF Application Manager.
 *
 * function hbbtvlib_closeApp()
 *   Destroys this application.
 *
 * function hbbtvlib_init_broadcast()
 *   Convenience function that integrates the broadcast video in your application.
 *
 * function hbbtvlib_release_broadcast()
 *   Convenience function that removes the broadcast video from your application.
 *
 * function hbbtvlib_current_service()
 *   Returns the DVB service ID.
 *
 * function hbbtvlib_tuneTo()
 * 	 Tunes to a DVB service
 */

var VK_RED = 403;
var VK_GREEN = 404;
var VK_YELLOW_SONY = 502;
var VK_YELLOW_SAMSUNG = 405;
var VK_YELLOW_LOEWE = 57856;
var VK_BLUE = 406;
var VK_LEFT = 37;
var VK_UP = 38;
var VK_RIGHT = 39;
var VK_DOWN = 40;
var VK_ENTER = 13;
var VK_0 = 48;
var VK_1 = 49;
var VK_2 = 50;
var VK_3 = 51;
var VK_4 = 52;
var VK_5 = 53;
var VK_6 = 54;
var VK_7 = 55;
var VK_8 = 56;
var VK_9 = 57;
var VK_PLAY = 415;
var VK_PAUSE = 19;
var VK_STOP = 413;
var VK_FAST_FWD_SONY = 473;
var VK_FAST_FWD_SAMSUNG = 417;
var VK_FAST_FWD_LOEWE = 57857;
var VK_REWIND = 412;
var VK_REWIND_LOEWE = 461;
var VK_BACK = 461;
var VK_BACK_SPACE = 8;
 
/**
 * The last error occured in hbbtvlib. If one of the functions returns false,
 * the error can be retrieved via this property.
 */
var hbbtvlib_lastError = "no error";
var isShow = false;

/**
 * Initializes the HbbTV library, i.e. it looks for the application object
 * and the keyset object. The keyset object will not be set, i.e. no keys are requested.
 *
 * @return true if the application and the keyset object are available
 */
function hbbtvlib_initialize() {
	try {
		// objects must be already included in the HTML DOM
		int_findOipfObjs();

		// if the application manager is available get also the keyset, otherwise give up.
		return (int_initAppObj() && int_initKeysetObj());

	} catch (e) {
		hbbtvlib_lastError = "Exception in hbbtvlib_init: " + e;
		int_app = null;
	}
	return false;
};

/**
 * This function does everything HbbTV requires an application to do
 * when it wants to get visible.
 *
 * @return true if application.show and keyset.setValue succeeded.
 */
function hbbtvlib_show() {
	try {
		int_app.show();
		int_keyset.setValue(int_ksVisible);
		isShow = true;
		return true;
	} catch (e) {
		hbbtvlib_lastError = "Exception in hbbtvlib_show: " + e;
		return false;
	}
}

/**
 * This function does everything HbbTV requires an application to do
 * when it wants to transition to the hidden state.
 *
 * @return true if application.hide and keyset.setValue succeeded.
 */
function hbbtvlib_hide() {
	try {
		if (int_bc_video) int_bc_video.style.visibility = "visible";
		if (int_app == null) {
			window.close();
			isShow = false;
			return true;
		}
		int_app.hide();
		isShow = false;
		int_keyset.setValue(int_ksHidden);
		return true;
	} catch (e) {
		hbbtvlib_lastError = "Exception in hbbtvlib_hide: " + e;
		return false;
	}
}

/**
 * Overrides the default keysets.
 * Default is RED for hidden state, all for visible state.
 *
 * @param visibleSet a keyset bitmask
 * @param hiddenSet a keyset bitmask
 * @return
 */
function hbbtvlib_setKeysets(visibleSet, hiddenSet) {
	if (typeof visibleSet == "Number")
		int_ksVisible = visibleSet;
	if (typeof hiddenSet == "Number")
		int_ksHidden = hiddenSet;
};

/**
 * Starts a new application and destroys this application.
 *
 * @param appUrl including organization and application ids
 * @param fallbackUrl a fallback URL
 *
 * @return false
 */
function hbbtvlib_createApp(appUrl, fallbackUrl) {
	if (int_app) {
		try {
			if (appUrl && int_app.createApplication(appUrl, false)) {
				int_app.destroyApplication();
				isShow = true;
				return true;
			}
			hbbtvlib_lastError = "Failed to create app. URL: " + appUrl;
		} catch (e) {
			hbbtvlib_lastError = "Exception when starting app: " + e + " URL: " + appUrl;
		}
	} else {
		hbbtvlib_lastError = "Cannot start app. Application manager not available.";
	}

	if (fallbackUrl) {
		document.location.href = fallbackUrl;
	}
	return false;
};

/**
 * Destroys this application.
 *
 * @param fallBackUrl
 * @return
 */
function hbbtvlib_closeApp(fallBackUrl) {
	if (int_app) {
		try {
			int_app.destroyApplication();
			isShow = false;
			return true;
		} catch (e) {
			hbbtvlib_lastError = e;
		}
	} else if (fallBackUrl) {
		document.location.href = fallBackUrl;
	} else {
		window.close();
	}
	return false;
};

/**
 * Handle OIPF DAE Broadcast video
 */
var int_bc_video = null;
var int_bc_container = null;
var int_currentChannel = null;

/**
 * Creates and initializes a broadcast video inside the element
 * identified by the containerId. If no bc video can be included
 * the dummy picture is added instead of the bc.
 *
 * @param parentId the id of the HTML container where the video/broadcast object will be added
 * @param objId id which shall be set for the video/broadcast object
 * @param dummyPic an optional picture to be shown if video/broadcast can not be added
 *
 */
function hbbtvlib_init_broadcast(parentId, objId, dummyPic) {
	try {
		int_bc_container = document.getElementById(parentId);
		if (!int_bc_container)
			return false;

		// root container for video/broadcast object
		int_bc_container.innerHTML = '<object id="' + objId + '" type="video/broadcast" style="visibility: visible;"> </object>';
		int_bc_video = document.getElementById(objId);

		int_bc_video.onChannelChangeSucceeded = function (channel) {
			// TODO hande tuning success
			int_currentChannel = channel;
		};
		int_bc_video.onChannelChangeError = function (channel, errorState) {
			// TODO handle error state
			//int_vb_onError(objId, dummyPic);
		};
		int_bc_video.bindToCurrentChannel();

		return true;
	} catch (e) {
		hbbtvlib_lastError = e;
		int_vb_onError(objId, dummyPic);
	}
	return false;
};

function int_vb_onError(objId, dummyPic) {
	if (dummyPic) {
		int_bc_container.innerHTML = '<img id="' + objId + '" src="' + dummyPic + '" alt="TV Bild" />';
	} else {
		int_bc_container.innerHTML = "";
	}
	int_currentChannel = null;
	int_bc_video = null;
}

/**
 * Releases the video/broadcast object and removes the object from the DOM.
 */
function hbbtvlib_release_broadcast() {
	try {
		int_currentChannel = null;
		try {
			int_bc_video.release();
			int_bc_video = null;
		} catch (e1) {
			hbbtvlib_lastError = e1;
		}

		try {
			int_bc_container.innerHTML = "";
			int_bc_container = null;
		} catch (e1) {
			hbbtvlib_lastError = e1;
		}
	} catch (e) {
		hbbtvlib_lastError = e;
	}
};

/**
 * Requires hbbtvlib_init_broadcast
 *
 * @return the DVB service id of the current presented service or -1
 */
function hbbtvlib_current_service() {
	try {
		return int_bc_video.currentChannel.sid;
	} catch (e) {
		hbbtvlib_lastError = e;
	}
	return -1;
};

/**
 * Tunes to a DVB service identified by the DVB Triplet. The application may
 * get killed due to the application life cycle, i.e. if it is not signalled
 * with their application ID on the tuned service.
 *
 * @param onid the original network id
 * @param tsid the transport stream id
 * @param sid the service id
 *
 * @return false if there is no video broadcast object available or there is no
 * 	channel found for this triplet
 */
function hbbtvlib_tuneTo(onid, tsid, sid) {
	try {

		//TODO: move to DAE 1.1 API, this here is DAE 1.0 and was removed in DAE 1.1

		var chLst = int_bc_video.getChannelConfig().channelList;

		onid = (typeof(onid) == 'number') ? onid : parseInt(onid, 10);
		tsid = (typeof(tsid) == 'number') ? tsid : parseInt(tsid, 10);
		sid = (typeof(sid) == 'number') ? sid : parseInt(sid, 10);

		var ch = chLst.getChannelByTriplet(onid, tsid, sid);

		if (ch == null) {
			hbbtvlib_lastError = "Tuning failed, no channel object found for given DVB triplet.";
			return false;
		}

		int_bc_video.setChannel(ch, false);

		return true;
	} catch (e) {
		hbbtvlib_lastError = "Tuning failed due to " + e;
	}
	return false;
};

/**
 * Sets the onApplicationLoadError event handler.
 * @param fn the handler, as a function.
 * @return true or false, depending on result's operation.
 */
function hbbtvlib_onApplicationLoadError(fn) {
	if (int_app) {
		int_app.onApplicationLoadError = fn;
		return true;
	}
	return false;
}

/*
 * Library internal (private) properties and functions.
 */

/**
 * Array of OIPF DAE embedded objects. Access Key is the mime-type without "application/".
 */
var int_objs = null;

var int_objTypes = {
	appMan : "oipfApplicationManager",
	config : "oipfConfiguration"
};

/**
 * OIPF DAE Application object
 * 	- to show/hide the application
 * 	- create or destroy applications
 *  - providing the keyset object
 */
var int_app = null;

/**
 * The OIPF keyset object used to request keys from terminal.
 *
 * Usually this is the RED button in hidden mode, and up to all
 * available keys in visible mode.
 */
var int_keyset = null;

var int_ksHidden = null;

var int_ksVisible = null;

/**
 * Internal function to create OIPF embedded objects,
 * like ApplicationManager etc., if not already existing.
 */
function int_findOipfObjs() {

	if (int_objs == null) {
		int_objs = {};

	} else {
		hbbtvlib_lastError = "int_findOipfObjs called second time.";
		return;
	}

	// Look for existing objects
	var oipfObjs = document.getElementsByTagName("object");
	for (var i = 0; i < oipfObjs.length; i++) {

		var obj = oipfObjs.item(i);

		var objType = null;
		if (typeof obj.getAttribute == "function") {
			objType = obj.getAttribute("type");
		}

		if (!objType) {
			objType = obj.type;
		}

		if (!objType) {
			hbbtvlib_lastError = "Cannot determine type of embedded object";
			continue; // with next object
		}

		//alert(sType);
		for (var eType in int_objTypes) {
			if (objType == "application/" + int_objTypes[eType]) {
				int_objs[int_objTypes[eType]] = obj;
			}
		}
	}

	// try object factory if object is not included
	if ((!int_objs[int_objTypes.appMan]) && oipfObjectFactory) {
		int_objs[int_objTypes.appMan] = oipfObjectFactory.createApplicationManagerObject();
	}

};

/**
 * Retrieves the OIPF application object for the current application.
 *
 * @return
 */
function int_initAppObj() {
	try {
		var appMgr = int_objs[int_objTypes.appMan];
		int_app = appMgr.getOwnerApplication(document);
		return true;
	} catch (e) {
		hbbtvlib_lastError = "application manager is not available";
		int_app = null;
	}
	return false;
}

/**
 * Retrieves the keyset object for HbbTV 1.1.1 and 0.5 implementations.
 *
 * Sets default keysets for hidden and visible modes.
 */
function int_initKeysetObj() {
	// try HbbTV 1.1.1
	try {
		int_keyset = int_app.privateData.keyset;
	} catch (e) {
		int_keyset = null;
		// try HbbTV 0.5
		try {
			var tmp = int_objs[int_objTypes.config].keyset;
			tmp.setValue = function (val) {
				this.value = val;
			};
			int_keyset = tmp;

		} catch (e) {
			int_keyset = null;
			hbbtvlib_lastError = "keyset object is not available";
		}
	}

	if (int_keyset) {
		// set default key sets
		if (!int_ksHidden)
			int_ksHidden = int_keyset.RED;
		if (!int_ksVisible)
			int_ksVisible = 0x33F; // color + nav + vcr + numeric + alpha
	}

	return int_keyset != null;
};
