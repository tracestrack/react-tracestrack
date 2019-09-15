import { getTimezoneOffset } from "../pages/map/UploadModel.js";

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
