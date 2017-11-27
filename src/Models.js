export class MarkerType {
    static get red() { return 0; }
    static get green() { return 1; }
    static get newStar() { return -1; }
    static get searchHit() { return -2; }
    static get wiki() { return -3; }
    static get googlePlace() { return -4; }
}

/** Star model is used to render detailsidebar */
export function createNewStar(coord, type, recordName, address, data) {
    return {
	coord: coord,
	type: type,
	recordName: recordName,
	address: address,
	data: data
    };
}

/** Trace Model */
export function createTrace(detail, type, recordName, zoneRecordName, share, linkingId) {
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

