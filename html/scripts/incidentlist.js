/**
 * @fileoverview Contains code defining the IncidentList class.
 * @requires jQuery
 */

/**
 * Creates a list of CHP Incidents from CHP Incident data.
 * @class Represents a set of CHP Incidents.
 * @param {Array} data An array of CHP Incidents from SacTraffic.org.
 * @property {Number} length The number of Incidents in the list.
 */
var IncidentList = function (element) {
	this._incidents = {};
	this._container = $(element);
};

/**
 * Gets an Incident by it's CHP ID.
 * @param {String} id The Incident's CHP ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncident = function(id) {
	return this._incidents[id];
};

IncidentList.prototype.getIncidents = function() {
	return this._incidents;
};

IncidentList.prototype.addIncident = function (incident) {
  incident.show(this._subContainer);
  this._incidents[incident.ID] = incident;
}

IncidentList.prototype.delIncident = function (incident) {
  incident.unShow();
  delete this._incidents[incident.ID];
}

IncidentList.prototype.containsId = function (id) {
  var ids = [];
  for (var incident_id in this.getIncidents()) {
    ids.push(incident_id);
  }
  return (ids.indexOf(id) === -1) ? false : true;
}

IncidentList.prototype.size = function () {
  var size = 0;
  for (var incident_id in this.getIncidents()) {
    size++;
  }
  return size;
}

IncidentList.prototype.update = function (data) {
  var new_data_ids = [];
  this._subContainer = $('<ul/>').addClass('incidentlist');

  // Add or update existing incidents
  for (var x = 0; x < data.length; x++) {
    var incident = new Incident(data[x]);
    new_data_ids.push(incident.ID);

    this.addIncident(incident);
	}

  // Remove incidents we no longer have
  for (var id in this.getIncidents()) {
    var incident = this.getIncident(id);
    if (new_data_ids.indexOf(incident.ID) === -1) {
      this.delIncident(incident);
    }
  }

  if (this._subContainer.children().length > 0) {
    this._subContainer.prependTo(this._container).children('.incident').fadeIn();
  }

  // cleanup empty ul containers
  $('.incidentlist:empty').remove();
}

/**
 * Get the bounding box of the incidents.
 * @returns {Object}
 */
IncidentList.prototype.getBounds = function() {
  var lats = [];
  var lons = [];

  for (var id in this.getIncidents()) {
    var incident = this.getIncident(id);
    lats.push(incident.geolocation.lat);
    lons.push(incident.geolocation.lon);
  }

	return {
	  sw: {
	    lat: lats.min(),
	    lon: lons.min()
	  },
	  ne: {
	    lat: lats.max(),
	    lon: lons.max()
	  }
	};
};
