var mapboxgl = require('mapbox-gl'),
    point = require('turf-point'),
    bearing = require('turf-bearing'),
    flip = require('turf-flip'),
    distance = require('turf-distance'),
    linestring = require('turf-linestring'),
    simplify = require('turf-simplify')
    L = require('leaflet'),
    routing = require('leaflet-routing-machine'),
    routeStyles = [
      {
        'line-color': '#000',
        'line-width': 10,
        'line-opacity': 0.3
      },
      {
        'line-color': '#fff',
        'line-width': 8,
        'line-opacity': 0.7
      },
      {
        'line-color': '#a00',
        'line-width': 3,
        'line-opacity': 0.8
      }
    ],
    routeBearing = function(r, i, j) {
      var p1 = flip(point(r.coordinates[i])),
          p2 = flip(point(r.coordinates[j]));

      return bearing(p1, p2);
    },
    flyRoute = function(r, i) {
      if (i > r.geometry.coordinates.length - 2) {
        return;
      }

      var p1 = point(r.geometry.coordinates[i]),
          p2 = point(r.geometry.coordinates[i + 1]),
          b = bearing(p1, p2),
          d = distance(p1, p2),
          duration = Math.round(d * 3600 * 1000 / 400),
          c = r.geometry.coordinates[i + 1],
          options = {
            center: [c[1], c[0]],
            bearing: b,
            duration: duration
          };

      if (i < r.geometry.coordinates.length - 2) {
        options.easing = function(t) { return t; };
      }

      map.easeTo(options);
      setTimeout(function() { flyRoute(r, i + 1); }, duration);
    };

mapboxgl.accessToken = 'pk.eyJ1IjoibGllZG1hbiIsImEiOiJZc3U4UXowIn0.d4yPyJ_Bl7CAROv15im36Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v7.json',
    center: [40, -74.50],
    zoom: 9
  }),
  router = routing.osrm(),
  routeSource = new mapboxgl.GeoJSONSource();

map.on('style.load', function() {
  router.route([
      new routing.Waypoint(L.latLng(57.7318, 11.9418)),
      new routing.Waypoint(L.latLng(57.6974, 11.9436))
    ], function(err, routes) {
      var r;
      if (!err) {
        r = routes[0];
        routeSource.setData({
          'type': 'LineString',
          'coordinates': r.coordinates.map(function(ll) { return [ll[1], ll[0]]; })
        });
        map.addSource('route', routeSource);
        routeStyles.forEach(function(s, i) {
          map.addLayer({
            'id': 'route-style-' + i,
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': s
          });
        });
        map.flyTo({
          center: r.coordinates[0],
          pitch: 80,
          bearing: routeBearing(r, 0, 1),
          duration: 500,
          zoom: 18
        });
        map.once('moveend', function() {
          map.easeTo({pitch:70, duration: 1000});
          setTimeout(function() {
            flyRoute(flip(simplify(linestring(r.coordinates), 1e-4, true)), 0);
          }, 1000);
        });
      }
    });
});
