import { LoadedAreaManager } from "../pages/map/Map.js";

let loadedAreaManager = null;

beforeEach(() => {
  loadedAreaManager = new LoadedAreaManager();
});

test("Test same area", () => {
  loadedAreaManager.addLoaded(5, 10, 1, 5, false);
  expect(loadedAreaManager.isLoaded(5, 10, 1, 5, false)).toBe(true);
});

test("Zoom in", () => {
  loadedAreaManager.addLoaded(5, 10, 1, 5, false);
  expect(loadedAreaManager.isLoaded(4, 9, 2, 6, false)).toBe(true);
});

test("Zoom in with detail", () => {
  loadedAreaManager.addLoaded(5, 10, 1, 5, false);
  expect(loadedAreaManager.isLoaded(4, 9, 2, 6, true)).toBe(false);
});

test("Zoom out without detail", () => {
  loadedAreaManager.addLoaded(4, 9, 2, 6, true);
  expect(loadedAreaManager.isLoaded(5, 10, 1, 5, false)).toBe(false);
});

test("Same zoom level move", () => {
  loadedAreaManager.addLoaded(10, 10, 0, 0, false);
  expect(loadedAreaManager.isLoaded(11, 10, 1, 0, false)).toBe(false);
});
