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
  var $listItem = $('#' + this.ID);

  if ($listItem.length === 0) {
    // Is new, build from scratch
    $listItem = $('<li/>').attr('id', this.ID).addClass('incident').addClass('vevent').click(
      function () {
        $(this).children('.details').slideToggle('fast');
      }
    ).hide().appendTo(element);

    // button container...
    $('<div/>').addClass('button').hide().appendTo($listItem);

    // Area
    $('<div/>').addClass('area').html(this.Area).appendTo($listItem);

    // LogType
    $('<div/>').addClass('logtype summary').html(this.LogType).appendTo($listItem);

    // Location
    $('<div/>').addClass('location').html(this.Location).appendTo($listItem);

    // Time
    $('<div/>').addClass('logtime').html(this.LogTime.ago() + ", " + this.LogTime.getPrettyTime()).append(
      $('<span/>').addClass('dtstart').html(this.LogTime.getISO8601())
    ).appendTo($listItem);

    // Add the geo microformat
    if (point) {
      $('<div/>').addClass('geo').append(
        $('<span/>').addClass('latitude').html(point.lat)
      ).append(
        $('<span/>').addClass('longitude').html(point.lon)
      ).appendTo($listItem);
    }
  } else {
    // Existing, just update...
    $listItem.children('.logtype').html(this.LogType);
  }

  // Light up the button
  if (this.hasSigalert) {
    $listItem.children('.button').removeClass('blue').addClass('red').html('sigalert').show();
  } else if (this.LogDetails.details.length > 0) {
    $listItem.children('.button').removeClass('red').addClass('blue').html('details').show();
  }

  // Details
  if (this.LogDetails.details.length > 0) {
    var $detailsUList = $listItem.children('.details').empty();
    if ($detailsUList.length === 0) {
      $detailsUList = $('<ul/>').addClass('details').appendTo($listItem);
    }

    for (var x = 0; x < this.LogDetails.details.length; x++) {
      var detail = this.LogDetails.details[x];
      var detailTime = $('<span/>').addClass('detailtime').html(detail.DetailTime);
      var incidentDetail = $('<span/>').addClass('incidentdetail').html(detail.IncidentDetail);

      if (detail.IncidentDetail.match(/sigalert\s*\*/)) {
        incidentDetail.addClass('sigalert');
      }

      $('<li/>').append(detailTime).append(': ').append(incidentDetail).appendTo($detailsUList);
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

Incident.prototype.unShow = function () {
  $incident = $('#'+this.ID);
  $incident.slideUp(function() {
    $(this).remove();
  });
}

Incident.prototype.compare = function (incident) {
  if (this.ID !== incident.ID) {
    return false;
  }
  if (this.LogType !== incident.LogType) {
    return false;
  }
  if (this.LogDetails.details.length !== incident.LogDetails.details.length) {
    return false;
  }

  return true;
}
