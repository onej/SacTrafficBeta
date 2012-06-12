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
var IncidentList = function (data) {
	this.length = data.length;
	this._incidents = [];
	this._index = {};
	this._lats = [];
	this._lons = [];
	this.ids = [];

	for (var x = 0; x < data.length; x++) {
		var incident = new Incident(data[x]);

    this._incidents.push(incident);
		this._index[incident.ID] = x;
		if (incident.geolocation) {
		  this._lats.push(incident.geolocation.lat);
		  this._lons.push(incident.geolocation.lon);
		}
		this.ids.push(incident.ID);
	}


};

/**
 * Gets an Incident by it's index number.
 * @param {Number} index The Incident's index in the IncidentList.
 * @returns {Incident}
 */
IncidentList.prototype.getIncident = function(index) {
	return this._incidents[index];
};

/**
 * Gets an Incident by it's CHP ID.
 * @param {String} id The Incident's CHP ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncidentById = function(id) {
	return this._incidents[this._index[id]];
};

/**
 * Get the bounding box of the incidents.
 * @returns {Object}
 */
IncidentList.prototype.getBounds = function() {
	return {
	  sw: {
	    lat: this._lats.min(),
	    lon: this._lons.min()
	  },
	  ne: {
	    lat: this._lats.max(),
	    lon: this._lons.max()
	  }
	};
};

/**
 * Makes a standard unordered list for the display of Incidents.
 * @param {String|jQuery} element An element (a selector, element, HTML string, or jQuery object) to append the unordered list to.
 */
IncidentList.prototype.show = function (element) {
  // Remove incidents we no longer have
  var self = this;
  $('.incident').each(function () {
    if (self.ids.indexOf(this.id) === -1) {
      $(this).slideUp(function() {
        $(this).remove()
      });
    }
  });

  // cleanup empty ul containers
  $('.incidentlist:empty').remove();

  var $ul = $('<ul/>').addClass('incidentlist');

  // Now show (or update) the incidents
  for (var x = 0; x < this.length; x++) {
    this.getIncident(x).show($ul);
  }

  if ($ul.children().length > 0) {
    $ul.prependTo(element).children('.incident').fadeIn();
  }
};
