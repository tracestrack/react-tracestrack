import simplify from 'simplify-js';
import moment from "moment-timezone";

export function processPointsInGPXFile(points) {
  function transformXYtoLatLng(points) {
    return points.map((t) => {
      return {lat: t.y, lng:  t.x};
    });
  }
  
  let xypoints = [];
  for (var i in points) {
    xypoints.push({x: parseFloat(points[i].lng), y: parseFloat(points[i].lat)});
  }

  let detail = transformXYtoLatLng(simplify(xypoints, 0.00001, true));
  let medium = transformXYtoLatLng(simplify(xypoints, 0.0001, true));
  let coarse = transformXYtoLatLng(simplify(xypoints, 0.005, true));

  return {detail: detail, medium: medium, coarse: coarse};
}

export function getTimezoneOffset(lat, lng, date) {
  var tzlookup = require("tz-lookup");
  let tz = tzlookup(lat, lng);
  console.log(tz);
  return moment(date).tz(tz)._offset; // by minutes
}
