import { getTimezoneOffset, calculateDistanceOfTrace, createPoint } from "../pages/map/UploadModel.js";
import haversine from "haversine";

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
