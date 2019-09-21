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
    
    let array = [];

    Object.keys(points).forEach(function(key, index) {
      let t = this[key];
      array.push(Math.round(t.y * 1000000), Math.round(t.x * 1000000));
    }, points);

    return array;
  }
  
  let xypoints = [];
  for (var i in points) {
    xypoints.push({x: parseFloat(points[i].lng), y: parseFloat(points[i].lat)});
  }

  let detail = transformXYtoCKLatLng(simplify(xypoints, 0.00002, true));
  let medium = transformXYtoCKLatLng(simplify(xypoints, 0.0002, true));
  let coarse = transformXYtoCKLatLng(simplify(xypoints, 0.005, true));

  return {detail: detail, medium: medium, coarse: coarse};
}

export function getTimezoneOffset(lat, lng, date) {
  var tzlookup = require("tz-lookup");
  let tz = tzlookup(lat, lng);
  return moment(date).tz(tz)._offset; // by minutes
}

export function calculateDistanceOfTrace(points) {
  let value = points.reduce((accumulator, currentValue, index, array) => {
    if (index === 0) return 0.0;
    let v = haversine([currentValue.lat, currentValue.lng], [array[index-1].lat, array[index-1].lng], {unit: 'meter', format: '[lat,lon]'});
    return accumulator + v;
  }, 0);
  return Math.round(value * 100) / 100;
}

export function calculateDuration(points) {
  if (points.length <= 1)
    return 0;
  return (points[points.length - 1].date - points[0].date) / 1000;
}

export function calculateAvgSpeed(points) {
  let duration = calculateDuration(points);
  if (duration === 0)
    return 0;
  return Math.round(calculateDistanceOfTrace(points) / duration * 100) / 100;
}

export function calculateLowAlt(points) {
  return Math.round(points.reduce((accumulator, currentValue) => {
    return Math.min(accumulator, currentValue.alt);
  }, 99999));
}

export function calculateHighAlt(points) {
  return Math.round(points.reduce((accumulator, currentValue) => {
    return Math.max(accumulator, currentValue.alt);
  }, -9999));
}

export function calculateElevation(points) {
  let ele = points.reduce((accumulator, currentValue, index, array) => {
    if (index === 0) return 0.0;
    let ele = currentValue.alt - array[index-1].alt;
    return ele > 0 ? accumulator + ele : accumulator;
  }, 0);
  return Math.round(ele * 0.95);
}

export function calculateBoundingBox(points) {
  let init = {maxLat: -90, minLat: 90, maxLng: -180, minLng: 180};
  let bbox = points.reduce((accumulator, currentValue) => {
    return {
      maxLat: Math.max(accumulator.maxLat, currentValue.lat),
      minLat: Math.min(accumulator.minLat, currentValue.lat),
      maxLng: Math.max(accumulator.maxLng, currentValue.lng),
      minLng: Math.min(accumulator.minLng, currentValue.lng)
    };
  }, init);
  return {
    maxLat: Math.round(bbox.maxLat * 1000000),
    maxLng: Math.round(bbox.maxLng * 1000000),
    minLat: Math.round(bbox.minLat * 1000000),
    minLng: Math.round(bbox.minLng * 1000000)
  };
}

export function calculateSHA256(gpxString) {
  let sha256 = require('js-sha256');
  return sha256(gpxString);
}
