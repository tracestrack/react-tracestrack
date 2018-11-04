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

export function Coord(lat, lng) {
    return {lat: lat, lng: lng};
}

export function Types() {

    return {
	"Walking": 0,
	"Cycling": 1,
	"Running": 2,
	"Driving": 3,
	"Railway": 4,
	"Waterway": 5,
	"Skyway": 6,
	"Visited": 7,
	"Want to visit": 8
    };

}

