import simplify from 'simplify-js';
import moment from "moment-timezone";
import haversine from "haversine";

export function createPoint(lat, lng, alt, date) {
  return {lat: lat, lng: lng, alt: alt, date: date};
}

export function processPointsInGPXFile(points) {
  
  if (points.length <= 1)
    return [];

  function transformXYtoCKLatLng(points) {
    return points.map((t) => {
      return {lat: Math.round(t.y * 1000000), lng: Math.round(t.x * 1000000)};
    });
  }
  
  let xypoints = [];
  for (var i in points) {
    xypoints.push({x: parseFloat(points[i].lng), y: parseFloat(points[i].lat)});
  }

  let detail = transformXYtoCKLatLng(simplify(xypoints, 0.00001, true));
  let medium = transformXYtoCKLatLng(simplify(xypoints, 0.0001, true));
  let coarse = transformXYtoCKLatLng(simplify(xypoints, 0.005, true));

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
  let duration = calculateDuration(points);
  if (duration == 0)
    return 0;
  return calculateDistanceOfTrace(points) / duration;
}

export function calculateLowAlt(points) {
  return points.reduce((accumulator, currentValue) => {
    return Math.min(accumulator, currentValue.alt);
  }, 99999);
}

export function calculateHighAlt(points) {
  return points.reduce((accumulator, currentValue) => {
    return Math.max(accumulator, currentValue.alt);
  }, -9999);
}

export function calculateElevation(points) {
  let ele = points.reduce((accumulator, currentValue, index, array) => {
    if (index === 0) return 0.0;
    let ele = currentValue.alt - array[index-1].alt;
    return ele > 0 ? accumulator + ele : accumulator;
  }, 0);
  return ele * 0.95;
}
