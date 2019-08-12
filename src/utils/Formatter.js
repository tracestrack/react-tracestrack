export function formatDistance(v) {
  v = v / 1000;
  return v.toFixed(2) + " KM";
}

export function formatAltitude(v) {
  return v.toFixed(0) + " M";
}

export function formatSpeed(v) {
  var ret = v * 3.6;
  return ret.toFixed(2) + " KM/H";
}

function padZeroForTwoDigits(num) {
    return String(num).padStart(2, '0');
}

export function formatDate(date) {
    return date.getUTCFullYear() + "/" + padZeroForTwoDigits(date.getUTCMonth() + 1) + "/" + padZeroForTwoDigits(date.getUTCDate()) + " " + padZeroForTwoDigits(date.getUTCHours()) + ":" + padZeroForTwoDigits(date.getUTCMinutes());
}

export function formatDuration(sec_num) {
  sec_num = Math.floor(sec_num);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  return padZeroForTwoDigits(hours) + ':' + padZeroForTwoDigits(minutes) + ':' + padZeroForTwoDigits(seconds);
}

export function formatCoordinate(lat, lng) {
  return lat.toFixed(6) + ", " + lng.toFixed(6);
}
