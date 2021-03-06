var exports;
if (typeof module === "object" && exports) {
  exports = module.exports;
} else if (typeof window !== "undefined") {
  exports = window["eviltransform"] = {};
}

var earthR = 6378137.0;

let _CHINA_BORDER = [[37.474858, 124.562988], [47.576526, 135.791016], [53.800651, 122.431641], [41.178654, 106.171875], [49.066668, 87.758789], [38.993572, 73.652344], [30.789037, 79.760742], [27.332735, 97.031250], [22.146708, 99.492187], [23.281719, 106.040039], [17.224758, 108.764648], [20.427013, 115.883789], [28.265682, 123.134766], [37.474858, 124.562988]];

function isInChina(lat, lng) {

  let latBool = lat <= 53 && lat >= 18;
  let lonBool = lng <= 135 && lng >= 18;
  if ((latBool && lonBool) === false) {
    return false;
  }

  var ret = false;

  var j = _CHINA_BORDER.length - 1;
  for (var i = 0; i < _CHINA_BORDER.length; i++) {

    var cond1 = (_CHINA_BORDER[i][0] > lat) !== (_CHINA_BORDER[j][0] > lat);

    var long = (_CHINA_BORDER[j][1] - _CHINA_BORDER[i][1]) * (lat - _CHINA_BORDER[i][0]) / (_CHINA_BORDER[j][0] - _CHINA_BORDER[i][0]) + _CHINA_BORDER[i][1];
    if (cond1 && lng < long) {
      ret = !ret;
    }
    j = i;
  }

  return ret;
}


function transform(x, y) {
  var xy = x * y;
  var absX = Math.sqrt(Math.abs(x));
  var xPi = x * Math.PI;
  var yPi = y * Math.PI;
  var d = 20.0 * Math.sin(6.0 * xPi) + 20.0 * Math.sin(2.0 * xPi);

  var lat = d;
  var lng = d;

  lat += 20.0 * Math.sin(yPi) + 40.0 * Math.sin(yPi / 3.0);
  lng += 20.0 * Math.sin(xPi) + 40.0 * Math.sin(xPi / 3.0);

  lat += 160.0 * Math.sin(yPi / 12.0) + 320 * Math.sin(yPi / 30.0);
  lng += 150.0 * Math.sin(xPi / 12.0) + 300.0 * Math.sin(xPi / 30.0);

  lat *= 2.0 / 3.0;
  lng *= 2.0 / 3.0;

  lat += -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * xy + 0.2 * absX;
  lng += 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * xy + 0.1 * absX;

  return { lat: lat, lng: lng };
}

function delta(lat, lng) {
  var ee = 0.00669342162296594323;
  var d = transform(lng - 105.0, lat - 35.0);
  var radLat = lat / 180.0 * Math.PI;
  var magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  d.lat = (d.lat * 180.0) / ((earthR * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  d.lng = (d.lng * 180.0) / (earthR / sqrtMagic * Math.cos(radLat) * Math.PI);
  return d;
}

function wgs2gcj(wgsLat, wgsLng) {
  if (!isInChina(wgsLat, wgsLng)) {
    return { lat: wgsLat, lng: wgsLng };
  }
  var d = delta(wgsLat, wgsLng);
  return { lat: wgsLat + d.lat, lng: wgsLng + d.lng };
}
exports.wgs2gcj = wgs2gcj;

function gcj2wgs(gcjLat, gcjLng) {
  if (!isInChina(gcjLat, gcjLng)) {
    return { lat: gcjLat, lng: gcjLng };
  }
  var d = delta(gcjLat, gcjLng);
  return { lat: gcjLat - d.lat, lng: gcjLng - d.lng };
}
exports.gcj2wgs = gcj2wgs;

function gcj2wgs_exact(gcjLat, gcjLng) {
  // newCoord = oldCoord = gcjCoord
  var newLat = gcjLat, newLng = gcjLng;
  var oldLat = newLat, oldLng = newLng;
  var threshold = 1e-6; // ~0.55 m equator & latitude

  for (var i = 0; i < 30; i++) {
    // oldCoord = newCoord
    oldLat = newLat;
    oldLng = newLng;
    // newCoord = gcjCoord - wgs_to_gcj_delta(newCoord)
    var tmp = wgs2gcj(newLat, newLng);
    // approx difference using gcj-space difference
    newLat -= gcjLat - tmp.lat;
    newLng -= gcjLng - tmp.lng;
    // diffchk
    if (Math.max(Math.abs(oldLat - newLat), Math.abs(oldLng - newLng)) < threshold) {
      break;
    }
  }
  return { lat: newLat, lng: newLng };
}
exports.gcj2wgs_exact = gcj2wgs_exact;

function distance(latA, lngA, latB, lngB) {
  var pi180 = Math.PI / 180;
  var arcLatA = latA * pi180;
  var arcLatB = latB * pi180;
  var x = Math.cos(arcLatA) * Math.cos(arcLatB) * Math.cos((lngA - lngB) * pi180);
  var y = Math.sin(arcLatA) * Math.sin(arcLatB);
  var s = x + y;
  if (s > 1) {
    s = 1;
  }
  if (s < -1) {
    s = -1;
  }
  var alpha = Math.acos(s);
  var distance = alpha * earthR;
  return distance;
}
exports.distance = distance;

function gcj2bd(gcjLat, gcjLng) {
  if (!isInChina(gcjLat, gcjLng)) {
    return { lat: gcjLat, lng: gcjLng };
  }

  var x = gcjLng, y = gcjLat;
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * Math.PI);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * Math.PI);
  var bdLng = z * Math.cos(theta) + 0.0065;
  var bdLat = z * Math.sin(theta) + 0.006;
  return { lat: bdLat, lng: bdLng };
}
exports.gcj2bd = gcj2bd;

function bd2gcj(bdLat, bdLng) {
  if (!isInChina(bdLat, bdLng)) {
    return { lat: bdLat, lng: bdLng };
  }

  var x = bdLng - 0.0065, y = bdLat - 0.006;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
  var gcjLng = z * Math.cos(theta);
  var gcjLat = z * Math.sin(theta);
  return { lat: gcjLat, lng: gcjLng };
}
exports.bd2gcj = bd2gcj;

function wgs2bd(wgsLat, wgsLng) {
  var gcj = wgs2gcj(wgsLat, wgsLng);
  return gcj2bd(gcj.lat, gcj.lng);
}
exports.wgs2bd = wgs2bd;

function bd2wgs(bdLat, bdLng) {
  var gcj = bd2gcj(bdLat, bdLng);
  return gcj2wgs(gcj.lat, gcj.lng);
}
exports.bd2wgs = bd2wgs;

export default exports;
