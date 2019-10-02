import { getCountryCode, getCountrySubdivision } from "../../services/google.js";
import { jumbo_kastelenplein, golden_bridge } from './resources/googlePlaceSamples.js';

it("test get country code", () => {
  expect(getCountryCode(jumbo_kastelenplein)).toBe("NL");
  expect(getCountryCode(golden_bridge)).toBe("US");
});

it("test get country subdivision", () => {
  expect(getCountrySubdivision(jumbo_kastelenplein)).toBe("Noord-Brabant");
  expect(getCountrySubdivision(golden_bridge)).toBe("California");
});
