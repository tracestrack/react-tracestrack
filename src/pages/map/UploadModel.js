import simplify from 'simplify-js';
import moment from "moment-timezone";
import haversine from "haversine";

export function createPoint(lat, lng, alt, date) {
  return {lat: lat, lng: lng, alt: alt, date: date};
}

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
  return moment(date).tz(tz)._offset; // by minutes
}

export function calculateDistanceOfTrace(points) {
  return points.reduce((accumulator, currentValue, index, array) => {
    if (index === 0) return 0.0;
    let v = haversine([currentValue.lat, currentValue.lng], [array[index-1].lat, array[index-1].lng], {unit: 'meter', format: '[lat,lon]'});
    return accumulator + v;
  }, 0);
}

export function calculateDuration(points) {
  if (points.length <= 1)
    return 0;
  return (points[points.length - 1].date - points[0].date) / 1000;
}

export function calculateAvgSpeed(points) {
  if (points.length <= 1)
    return 0;
  return calculateDistanceOfTrace(points) / calculateDuration(points);
}
