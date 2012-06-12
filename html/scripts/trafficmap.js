/**
 * @fileoverview Contains code defining the TrafficMap class.
 * @requires Google Maps API
 * @requires jQuery
 */

/**
 * Creates a new traffic map.
 * @class Represents a traffic map.
 * @param {String} elementId An ID to load the map into.
 */
var TrafficMap = function (elementId) {
  this._live_cams = [];
  this._traffic_overlay = null;
  this._markers = {};
  this._icons = {};
  this._globalInfoWindow = new google.maps.InfoWindow();
  this._map_has_been_moved = false;

  var mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(38.56, -121.40),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    mapTypeControl: false,
    scrollwheel: false,
    navigationControlOptions: {
      style: google.maps.NavigationControlStyle.SMALL
    }
  };
  this.gmap = new google.maps.Map(document.getElementById(elementId), mapOptions);

  // Style the map...
  var sactrafficMapStyle = [
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        { lightness: 90 }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        { hue: "#ff0000" },
        { saturation: -25 },
        { visibility: "simplified" }
      ]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { saturation: -100 },
        { visibility: "simplified" }
      ]
    },
    {
      featureType: "road.arterial",
      elementType: "labels",
      stylers: [
        { saturation: -100 },
        { lightness: 10 }
      ]
    }
  ];
  var sactrafficMapType = new google.maps.StyledMapType(sactrafficMapStyle, {name: "SacTraffic"});
  this.gmap.mapTypes.set('sactraffic', sactrafficMapType);
  this.gmap.setMapTypeId('sactraffic');

  // Setup the map buttons.
  this.make_traffic_button();
  this.make_camera_button();

  if (this.getState('live_cams')) {
    this.show_live_cams();
  }
  if (this.getState('traffic')) {
    this.show_traffic();
  }

  // Events...
  var self = this;
  google.maps.event.addListener(this.gmap, 'dragend', function() {
    self._map_has_been_moved = true;
  });
  google.maps.event.addListener(this.gmap, 'resize', function() {
    self.fitIncidents();
  });
}

/**
 * Makes a show/hide traffic button to enable/disable the traffic overlay
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_traffic_button = function () {
  var self = this;

  this.traffic_button = document.createElement('div');
  this.traffic_button.innerHTML = 'Show Traffic';
  this.traffic_button.className = 'button blue';
  this.traffic_button.onclick = function () {
    if (self.getState('traffic')) {
      self.hide_traffic();
    } else {
      self.show_traffic();
    }
  };

  var button_container = document.createElement('div');
  button_container.className = 'mapbutton';
  button_container.appendChild(this.traffic_button);

  this.gmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(button_container);
};

/**
 * Makes a show/hide camera button to enable/disable the live camera markers
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_camera_button = function () {
  var self = this;

  this.camera_button = document.createElement('div');
  this.camera_button.innerHTML = 'Show Cameras';
  this.camera_button.className = 'button blue';
  this.camera_button.onclick = function () {
    if (self.getState('live_cams')) {
      self.hide_live_cams();
    } else {
      self.show_live_cams();
    }
  };

  var button_container = document.createElement('div');
  button_container.className = 'mapbutton';
  button_container.appendChild(this.camera_button);

  this.gmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(button_container);
};

/**
 * Update incident data.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
TrafficMap.prototype.update = function (incidents) {
  this.incidents = incidents;

  // remove incidents we no longer have
  for (var id in this._markers) {
    if (incidents.ids.indexOf(id) === -1) {
      this._markers[id].setMap(null);
      delete this._markers[id];
    }
  }

  for (var x = 0; x < incidents.length; x++) {
    var incident = incidents.getIncident(x);

    if (incident.geolocation) {
      var marker = this._markers[incident.ID];
      if (typeof(marker) === "undefined") {
        this._markers[incident.ID] = this.make_marker(incident);
      } else {
        // Existing, just update the LogType - FIXME: how to update infowindows?
        var self = this;
        //google.maps.event.clearListeners(marker, 'click');
        //google.maps.event.addListener(marker, 'click', function() {
        //  self._globalInfoWindow.setContent('<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + incident.LogTime.getPrettyDateTime() + '</div></div>');
        //  self._globalInfoWindow.open(self.gmap, marker);
        //});
      }
    }
  }

  this.fitIncidents();
};

/**
 * Moves the map to cover the all the incidents.
 */
TrafficMap.prototype.fitIncidents = function () {
  if (typeof(this.incidents) !== 'undefined' && this.incidents.length > 1 && !this._map_has_been_moved) {
    var bounds = this.incidents.getBounds();
    this.gmap.fitBounds(new google.maps.LatLngBounds(
      new google.maps.LatLng (bounds.sw.lat, bounds.sw.lon),
      new google.maps.LatLng (bounds.ne.lat, bounds.ne.lon)
    ));
  }
}

/**
 * Tells Google to resize.
 */
TrafficMap.prototype.resize = function () {
  google.maps.event.trigger(this.gmap, 'resize');
}

/**
 * Shows the live cams.
 */
TrafficMap.prototype.show_live_cams = function () {
  if (this._live_cams.length === 0) {
    var self = this;

    $.ajax({
      url: "/data/cameras.txt",
      dataType: "text",
      success: function (cameras) {
        var rows = cameras.split(/\n/);
        for (var x = 1, xl = rows.length; x < xl; x++) {
          if (rows[x] === '' || rows[x].match(/^#/)) {
            continue;
          }

          var fields = rows[x].split(/,/);
          var camera = {
            name: fields[0],
            url: fields[1],
            location: {
              lat: fields[2],
              lon: fields[3]
            }
          };

          self._live_cams.push(_make_camera_marker(camera));
        }

        function _make_camera_marker (camera) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(camera.location.lat, camera.location.lon),
            icon: self.getIcon('camera'),
            title: camera.name,
            map: self.gmap
          });

          google.maps.event.addListener(marker, 'click', function() {
            self._globalInfoWindow.setContent('<div class="camera marker"><div class="title">Live Video</div><div class="button blue" onclick="window.open(\'' +  camera.url + '\')">' + camera.name + '</div>');
            self._globalInfoWindow.open(self.gmap, marker);
          });

          return marker;
        }
      }
    });
  } else {
    for (var x = 0, xl = this._live_cams.length; x < xl; x++) {
      this._live_cams[x].setMap(this.gmap);
    }
  }

  this.camera_button.innerHTML = 'Hide Cameras';
  this.setState('live_cams', true);
};

/**
 * Hides the live cams.
 */
TrafficMap.prototype.hide_live_cams = function () {
  for (var x = 0, xl = this._live_cams.length; x < xl; x++) {
    this._live_cams[x].setMap(null);
  }

  this.camera_button.innerHTML = 'Show Cameras';
  this.setState('live_cams', false);
};

/**
 * Shows the traffic overlay.
 */
TrafficMap.prototype.show_traffic = function () {
  this._traffic_overlay = new google.maps.TrafficLayer();
  this._traffic_overlay.setMap(this.gmap);

  this.traffic_button.innerHTML = 'Hide Traffic';
  this.setState('traffic', true);
};

/**
 * Hides the traffic overlay.
 */
TrafficMap.prototype.hide_traffic = function () {
  if (this._traffic_overlay) {
    this._traffic_overlay.setMap(null);
  }

  this.traffic_button.innerHTML = 'Show Traffic';
  this.setState('traffic', false);
};

/**
 * Centers the map on the given incident ID.
 * @param {String} incident_id The incident ID to center on.
 */
TrafficMap.prototype.centerOnId = function (incident_id) {
  if (this._markers[incident_id]) {
    this.gmap.panTo(this._markers[incident_id].getPosition());
  }
};

/**
 * Centers the map on a given location.
 * @param {Number} lat The latitude.
 * @param {Number} lon The longitude.
 */
TrafficMap.prototype.centerOnGeo = function (lat, lon) {
  this.gmap.panTo(new google.maps.LatLng(lat, lon));
};

/**
 * Getter for map state.
 * @param {String} key The key to get.
 * @return {Any} The value.
 */
TrafficMap.prototype.getState = function (key) {
  if (typeof(this._mapstate) === 'undefined') {
    if ('localStorage' in window && window['localStorage'] !== null) {
      this._mapstate = JSON.parse(localStorage.getItem('trafficmap_state')) || {};
    }
  }

  return this._mapstate[key];
};

/**
 * Setter for map state.  Also saved to localStorage if possible.
 * @param {String} key The key to set.
 * @param {Any} value The value to set.
 */
TrafficMap.prototype.setState = function (key, value) {
  this._mapstate[key] = value;
  if ('localStorage' in window && window['localStorage'] !== null) {
    localStorage.setItem('trafficmap_state', JSON.stringify(this._mapstate));
  }
};

/**
 * Hides the CHP incidents.
 */
TrafficMap.prototype.hideIncidents = function () {
  for (var id in this._markers) {
    this._markers[id].setMap(null);
  }
};

/**
 * Makes a GMarker for a given incident.
 * @param {Incident} incident The incident.
 * @returns {GMarker}
 */
TrafficMap.prototype.make_marker = function (incident) {
  var self = this;
  var icon = this.getIcon();

  if (/Fire/.test(incident.LogType)) {
    icon = this.getIcon('fire');
  } else if (/Maintenance|Construction/.test(incident.LogType)) {
    icon = this.getIcon('maintenance');
  } else if (/Collision.*(?:No|Unknown) Injur/.test(incident.LogType)) {
    icon = this.getIcon('collision');
  } else if (/Ambulance Enroute|Fatality/.test(incident.LogType)) {
    icon = this.getIcon('collision-serious');
  }

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(incident.geolocation.lat, incident.geolocation.lon),
    icon: icon,
    shadow: this.getIcon('shadow'),
    title: incident.LogType,
    map: this.gmap
  });

  google.maps.event.addListener(marker, 'click', function() {
    self._globalInfoWindow.setContent('<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + incident.LogTime.getPrettyDateTime() + '</div></div>');
    self._globalInfoWindow.open(self.gmap, marker);

    incident.highlightDisplay();
  });

  return marker;
};

/**
 * Icon generator for the traffic map.
 * @param {String} type The type of icon to return.
 */
TrafficMap.prototype.getIcon = function (type) {
  if (typeof(type) === 'undefined') {
    type = 'generic';
  }

  if (typeof(this._icons[type]) === 'undefined') {
    var url = '/images/map_sprites.png';
    var size = new google.maps.Size(32, 37);
    var origin = new google.maps.Point(0, 0);
    var anchor = new google.maps.Point(16, 37);
    var scaledSize = null;

    switch (type) {
      case 'maintenance':
        origin = new google.maps.Point(32, 0);
        break;
      case 'collision-serious':
        origin = new google.maps.Point(64, 0);
        break;
      case 'collision':
        origin = new google.maps.Point(96, 0);
        break;
      case 'fire':
        origin = new google.maps.Point(128, 0);
        break;
      case 'camera':
        origin = new google.maps.Point(160, 0);
        break;
      case 'shadow':
        size = new google.maps.Size(51, 37);
        origin = new google.maps.Point(0, 37);
        anchor = new google.maps.Point(26, 37);
        break;
    }

    this._icons[type] = new google.maps.MarkerImage(url, size, origin, anchor, scaledSize);
  }

  return this._icons[type];
}
