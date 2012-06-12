var dispatch = 'SACC';
var timeout = 0;
var min_map_size = 800;
var want_map = (document.documentElement.clientWidth >= min_map_size) ? true : false;
var incidentList;
var trafficMap;

get_incidents();

function get_incidents () {
  $.ajax({
    url: '/data/sa.xml',
    success: function (data) {
      incidentList = new IncidentList($(data).find('Dispatch[ID="'+dispatch+'"] Log'));
      incidentList.show(document.getElementById('incident_container'));

      if (want_map) {
        if (typeof(trafficMap) === "undefined") {
          setup_maps();
        } else {
          trafficMap.update(incidentList);
        }
      }
    }
  });

  if (timeout)
    clearTimeout(timeout);
  timeout = setTimeout(get_incidents, 60000);
}

function setup_maps() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCqAWhoCTR35Otz1QSkigXKlhLQWBw8vOQ&sensor=false&callback=setup_maps_cb";
  document.body.appendChild(script);
}

function setup_maps_cb() {
  $('#map_container').show();
  trafficMap = new TrafficMap('trafficmap');
  trafficMap.update(incidentList);
}

window.addEventListener('resize', function () {
  if (typeof(trafficMap) !== "undefined") {
    trafficMap.resize();
  }
});
