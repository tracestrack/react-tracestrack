import {
  getTimezoneOffset, calculateDistanceOfTrace, calculateDuration,
  createPoint, calculateElevation, calculateHighAlt, calculateLowAlt,
  processPointsInGPXFile, calculateBoundingBox,
  calculateSHA256
} from "../pages/map/UploadModel.js";

import haversine from "haversine";

const DATE = null;

it("test processPointsInGPXFile", () => {
  const p1 = createPoint(51.417864, 5.445850, 0, DATE);
  const p2 = createPoint(51.411864, 5.441850, 0, DATE);
  const p3 = createPoint(51.414371, 5.438404, 0, DATE);

  let onePoint = [p1];
  let onePointProcessed = processPointsInGPXFile(onePoint);
  expect(onePointProcessed).toStrictEqual([]);
  let twoPoints = [p1, p2];
  let twoPointsProcessed = processPointsInGPXFile(twoPoints);
  expect(twoPointsProcessed.detail).toStrictEqual([
    51417864, 5445850,
    51411864, 5441850
  ]);
  expect(twoPointsProcessed.medium).toStrictEqual([
    51417864, 5445850,
    51411864, 5441850
  ]);
  expect(twoPointsProcessed.coarse).toStrictEqual([
    51417864, 5445850,
    51411864, 5441850
  ]);
  let threePoints = [p1, p2, p3];
  let threePointsProcessed = processPointsInGPXFile(threePoints);
  expect(threePointsProcessed.detail).toStrictEqual([
    51417864, 5445850,
    51411864, 5441850,
    51414371, 5438404,
  ]);
  expect(threePointsProcessed.medium).toStrictEqual([
    51417864, 5445850,
    51411864, 5441850,
    51414371, 5438404
  ]);
  expect(threePointsProcessed.coarse).toStrictEqual([
    51417864, 5445850,
    51414371, 5438404
  ]);
});

it("test timezone offset", () => {
  let summerDate = new Date('2019-09-15T10:20:30Z');
  [[51.417864, 5.445850, 2], // Eindhoven
   [31.236472, 121.462355, 8], // Shanghai
   [37.776549, -122.450695, -7], // San Francisco
   [32.035438, 34.762802, 3], // Tel Aviv
   [-33.918150, 151.212044, 10], // Sydney
  ].forEach((e) => {
    expect(getTimezoneOffset(e[0], e[1], summerDate)).toBe(e[2] * 60);
  });

  let winterDate = new Date('2019-01-15T10:20:30Z');
  [[51.417864, 5.445850, 1], // Eindhoven
   [31.236472, 121.462355, 8], // Shanghai
   [37.776549, -122.450695, -8], // San Francisco
   [32.035438, 34.762802, 2], // Tel Aviv
   [-33.918150, 151.212044, 11], // Sydney
  ].forEach((e) => {
    expect(getTimezoneOffset(e[0], e[1], winterDate)).toBe(e[2] * 60);
  });
});

it("test calculateDistanceOfTrace", () => {
  const p1 = {
    latitude: 30.849635,
    longitude: -83.24559
  };
  const p2 = {
    latitude: 27.950575,
    longitude: -82.457178
  };
  const p3 = {
    latitude: 27.950175,
    longitude: -82.452178
  };

  let onePoints = [createPoint(p1.latitude, p1.longitude, 0, new Date())];
  expect(calculateDistanceOfTrace(onePoints)).toBe(0);
  
  let twoPoints = [createPoint(p1.latitude, p1.longitude, 0, new Date()),
                   createPoint(p2.latitude, p2.longitude, 0, new Date())
                  ];
  expect(calculateDistanceOfTrace(twoPoints)).toBe(haversine(p1, p2, {unit: 'meter'}));

  let threePoints = [createPoint(p1.latitude, p1.longitude, 0, new Date()),
                     createPoint(p2.latitude, p2.longitude, 0, new Date()),
                     createPoint(p3.latitude, p3.longitude, 0, new Date())
                    ];
  expect(calculateDistanceOfTrace(threePoints)).toBe(haversine(p1, p2, {unit: 'meter'}) + haversine(p3, p2, {unit: 'meter'}));
});

it("test duration", () => {
  const d1 = new Date('2019-09-15T10:20:00Z');
  const d2 = new Date('2019-09-15T10:21:00Z');
  const d3 = new Date('2019-09-15T10:21:30Z');

  let onePoint = [createPoint(0, 0, 0, d1)];
  expect(calculateDuration(onePoint)).toBe(0);
  let twoPoints = [createPoint(0, 0, 0, d1), createPoint(0, 0, 0, d2)];
  expect(calculateDuration(twoPoints)).toBe(60);
  let threePoints = [createPoint(0, 0, 0, d1), createPoint(0, 0, 0, d2), createPoint(0, 0, 0, d3)];
  expect(calculateDuration(threePoints)).toBe(90);
});

it("test altitude elevation", () => {
  const p1 = createPoint(0, 0, 10.1, DATE);
  const p2 = createPoint(0, 0, 11.1, DATE);
  const p3 = createPoint(0, 0, 9.1, DATE);

  let onePoint = [p1];
  expect(calculateElevation(onePoint)).toBe(0);
  let twoPoints = [p1, p2];
  expect(calculateElevation(twoPoints)).toBe(1);
  let threePoints = [p1, p2, p3];
  expect(calculateElevation(threePoints)).toBe(1);
});

it("test min altitude", () => {
  const p1 = createPoint(0, 0, 10.1, DATE);
  const p2 = createPoint(0, 0, 11.1, DATE);
  const p3 = createPoint(0, 0, 9.1, DATE);

  let onePoint = [p1];
  expect(calculateLowAlt(onePoint)).toBe(10);
  let twoPoints = [p1, p2];
  expect(calculateLowAlt(twoPoints)).toBe(10);
  let threePoints = [p1, p2, p3];
  expect(calculateLowAlt(threePoints)).toBe(9);
});

it("test calculate bounding box", () => {
  const p1 = createPoint(51.443348, 5.479333, 0, DATE); // Eindhoven
  const p2 = createPoint(48.857218, 2.341885, 0, DATE); // Paris
  const p3 = createPoint(37.803254, -122.417321, 0, DATE); // San Francisco
  const p4 = createPoint(-23.591268, -46.614789, 0, DATE); // São Paulo
  const p5 = createPoint(-33.855866, 151.216202, 0, DATE); // Sydney
  
  let onePoint = [p1];
  expect(calculateBoundingBox(onePoint)).toEqual({
    maxLat: 51443348, minLat: 51443348, maxLng: 5479333, minLng: 5479333
  });
  
  let p1p2 = [p1, p2];
  expect(calculateBoundingBox(p1p2)).toEqual({
    maxLat: 51443348, minLat: 48857218, maxLng: 5479333, minLng: 2341885
  });

  let p15 = [p1, p2, p3, p4, p5];
  expect(calculateBoundingBox(p15)).toEqual({
    maxLat: 51443348, minLat: -33855866, maxLng: 151216202, minLng: -122417321
  });
  
});

it("test calculate sha1", () => {
  let gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Traces">
    <metadata>
        <link href="http://traces.website">
            <text>Traces App</text>
        </link>
        <time>2017-12-16T16:15:01Z</time>
    </metadata>
    <trk>
        <name>Evening Walking</name>
        <trkseg>
            <trkpt lat="32.0763239963279" lon="34.7661344334807"><ele>13</ele><time>2017-12-16T16:15:01Z</time></trkpt>
<trkpt lat="32.0761664584578" lon="34.7662506066587"><ele>-9</ele><time>2017-12-16T16:15:23Z</time></trkpt>
<trkpt lat="32.0760057354645" lon="34.76614574905"><ele>-4</ele><time>2017-12-16T16:15:38Z</time></trkpt>
<trkpt lat="32.0758218365089" lon="34.766069054636"><ele>-2</ele><time>2017-12-16T16:15:53Z</time></trkpt>
<trkpt lat="32.0756430086047" lon="34.7660288215007"><ele>-4</ele><time>2017-12-16T16:16:09Z</time></trkpt>
<trkpt lat="32.0754729816989" lon="34.7661096230473"><ele>-3</ele><time>2017-12-16T16:16:26Z</time></trkpt>";
        </trkseg>
    </trk>
</gpx>`;
  
  expect(calculateSHA256(gpxString)).toBe("9e05eab1ef11211c7111a128aa440d2875534114234dbd9a56a6c64b9a7f9355");
});
