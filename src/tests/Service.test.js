import { getReverseGeocodingAPIURL } from "../services/tomtom.js";

process.env.REACT_APP_TomTom_key = "SAMPLEKEY";

it("test reverse geocoding api url", () => {
  expect(getReverseGeocodingAPIURL(51.419510, 5.405177)).toBe("https://api.tomtom.com/search/2/reverseGeocode/51.41951,5.405177.json?key=SAMPLEKEY");
});
