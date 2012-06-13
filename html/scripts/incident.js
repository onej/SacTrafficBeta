/**
 * @fileoverview Contains code defining the Incident class.
 * @requires jQuery
 */

/**
 * Creates an Incident from CHP Incident data.
 * @class Represents a CHP Incident.
 * @param {Object} data A CHP Incident.
 * @property {String} ID
 * @property {String} Area
 * @property {String} Location
 * @property {Object} LogDetails
 * @property {String} LogTime
 * @property {String} LogType
 * @property {Object} geolocation
 * @property {Boolean} hasSigalert
 */
var Incident = function (node) {
  //console.log(node);
  var $node = $(node);

  this.ID = $node.attr('ID');
  this.Area = $node.children('Area').text().decopify();
  this.Location = $node.children('Location').text().decopify();
  this.LogTime = new Date($node.children('LogTime').text().dequote().replace(/((?:A|P)M)$/, ' $1'));
  this.LogType = $node.children('LogType').text().decopify().replace(/^(?:\d+\w*|[A-Z]+)-/, '');
  this.hasSigalert = false;

  var geolocation = $node.children('LATLON').text().dequote();
  if (geolocation && geolocation !== '0:0') {
    var latlon = geolocation.split(/:/);
    this.geolocation = {};
    this.geolocation['lat'] = latlon[0] / 1000000;
    this.geolocation['lon'] = latlon[1] / 1000000 * -1;
  }

  this.LogDetails = {
    details: []
  };
  var detail_nodes = $node.find('details');
  for (var x = 0; x < detail_nodes.length; x++) {
    var $detail_node = $(detail_nodes[x]);

    var detailTime = $detail_node.children('DetailTime').text().dequote().replace(/^\w+.*?\d{4} /, '');
    var incidentDetail = $detail_node.children('IncidentDetail').text().decopify().toLowerCase();

    if (incidentDetail.match(/sigalert\*/) ) {
      this.hasSigalert = true;
    }

    if (detailTime && incidentDetail) {
      this.LogDetails.details.push({
        DetailTime: detailTime,
        IncidentDetail: incidentDetail
      });
    }
  }
}

/**
 * Makes a standard list item for display.
 * @param {String|jQuery} element An element (a selector, element, HTML string, or jQuery object) to append the listItem to.
 */
Incident.prototype.show = function (element) {
  var self = this;
  var point = (this.geolocation) ? this.geolocation : null;
  var $li = $('#' + this.ID);

  if ($li.length === 0) {
    // Is new, build from scratch
    $li = $('<li/>').attr('id', this.ID).addClass('incident').addClass('vevent').click(
      function () {
        $(this).children('.details').slideToggle('fast');
      }
    ).hide().appendTo(element);

    // Sigalert marker...
    if (this.hasSigalert) {
      $('<div/>').addClass('button red').html('sigalert').appendTo($li);
    } else if (this.LogDetails.details.length > 0) {
      $('<div/>').addClass('button blue').html('details').appendTo($li);
    }

    // LogType
    $('<div/>').addClass('logtype summary').html(this.LogType).appendTo($li);

    // Location
    $('<div/>').addClass('location').html(this.Location).appendTo($li);

    // Area
    $('<div/>').addClass('area').html(this.Area).appendTo($li);

    // Time
    $('<div/>').addClass('logtime').html(this.LogTime.getPrettyDateTime()).append(
      $('<span/>').addClass('dtstart').html(this.LogTime.getISO8601())
    ).appendTo($li);

    // Add the geo microformat
    if (point) {
      $('<div/>').addClass('geo').append(
        $('<span/>').addClass('latitude').html(point.lat)
      ).append(
        $('<span/>').addClass('longitude').html(point.lon)
      ).appendTo($li);
    }

    // Details
    this.showDetails($li);
  } else {
    // Existing, just update...
    $li.children('.logtype').html(this.LogType);
    this.showDetails($li);
  }
};

Incident.prototype.showDetails = function (element) {
  if (this.LogDetails.details.length > 0) {
    var $element = $(element);
    $element.css('cursor', 'pointer');

    var details = $element.children('.details').empty();
    if (details.length === 0) {
      details = $('<ul/>').addClass('details').appendTo($element);
    }

    for (var x = 0; x < this.LogDetails.details.length; x++) {
      var detail = this.LogDetails.details[x];
      var detailTime = $('<span/>').addClass('detailtime').html(detail.DetailTime);
      var incidentDetail = $('<span/>').addClass('incidentdetail').html(detail.IncidentDetail);

      if (detail.IncidentDetail.match(/sigalert\*/)) {
        incidentDetail.addClass('sigalert');
      }

      $('<li/>').append(detailTime).append(': ').append(incidentDetail).appendTo(details);
    }
  }
}

Incident.prototype.highlightDisplay = function () {
  var incident_element = document.getElementById(this.ID);
  incident_element.style.background = '#ddd';

  setTimeout(function () {
    incident_element.style.background = '#fff';
  }, 100);
}
