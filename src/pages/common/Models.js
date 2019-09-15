export class MarkerType {
  static get red() { return 0; }
  static get green() { return 1; }
  static get newStar() { return -1; }
  static get searchHit() { return -2; }
  static get wiki() { return -3; }
  static get googlePlace() { return -4; }
}

/** Star model is used to render detailsidebar */
export function Star(coord, type, recordName, data) {
  return {
    coord: coord,
    type: type,
    recordName: recordName,
    data: data
  };
}

/** Trace Model */
export function Trace(detail, type, recordName, zoneRecordName, share, linkingId) {
  return {
    detail: detail,
    recordName: recordName,
    zoneRecordName: zoneRecordName,
    share: share,
    type: type,
    linkingId: linkingId
  };
}

export function CKTraceModel() {
  let model = {
    title: "",
    type: 0,
    startDate: "",
    maxLat: 0,
    maxLng: 0,
    minLat: 0,
    minLng: 0,
    hashString: "",
    distance: 0,
    averageSpeed: 0,
    duration: 0,
    lowAlt: 0,
    highAlt: 0,
    elevation: 0,
    note: "",
    secondsFromGMT: 0,
    linkingId: 0,
    coarse: [],
    medium: [],
    detail: [],
    gpxFile: ""
  };

  Object.seal(model);
  return model;
}

export function Coord(lat, lng) {
  return {lat: lat, lng: lng};
}

export function TraceTypes() {

  return {
    "Walking": 0,
    "Cycling": 1,
    "Running": 2,
    "Driving": 3,
    "Railway": 4,
    "Waterway": 5,
    "Skyway": 6
  };

}

export function StarTypes() {
  return {
    "Visited": 7,
    "Want to visit": 8
  };

}

export function Types() {
  return { ...TraceTypes(), ...StarTypes() };
}

