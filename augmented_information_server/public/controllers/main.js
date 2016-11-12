/**
 * Created by ctdesk241 on 17/09/2014.
 */
/**
 * Controller for the main view.
 * @constructor
 */
function MainController() {
    initHbbtv();
    this._addEventHandlers();
    setBroadcastVideo();
    this._initMap();
    this._initSocket();
}

MainController.URL = 'http://localhost:22000';
MainController.TOPIC = 'geodata';

MainController.prototype.$map = $('#map');
MainController.prototype.Lmap = null;
MainController.prototype._socket = null;

MainController.prototype._initMap = function() {
    this.Lmap = L.map('map', { zoomControl:false }).setView([48.015190, 37.803646], 15);
    L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        attribution: '',
        subdomains: ['otile1','otile2','otile3','otile4']
    }).addTo( this.Lmap );
    var popup = L.popup()
        .setLatLng([48.015190, 37.803646])
        .setContent("Donetsk")
        .openOn(this.Lmap);
	this.$map.focus();
};

MainController.prototype._addEventHandlers = function() {
	var self = this;
	document.addEventListener("keydown", function(e) {
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
			case VK_1:
				self.Lmap.zoomOut(1);
				break;
			case VK_3:
				self.Lmap.zoomIn(1);
				break;
		}
	});
};

MainController.prototype._initSocket = function() {
    this._socket = io(MainController.URL);
    this._socket.on(MainController.TOPIC, function(data) {
        console.log(data);
    });
};