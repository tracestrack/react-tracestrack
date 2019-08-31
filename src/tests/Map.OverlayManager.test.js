import { OverlayManager } from "../pages/map/Map.js";

const RECORD_NAME_1 = "r1";
const RECORD_NAME_2 = "r2";

let overlayManager = null;

beforeEach(() => {
  overlayManager = new OverlayManager();
});

it("no layer, test low detail", () => {
  expect(overlayManager.getCount()).toBe(0);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, false)).toBe(true);
});

it("no layer, test high detail", () => {
  expect(overlayManager.getCount()).toBe(0);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, true)).toBe(true);
});

it("one low detail layer, test low detail", () => {
  overlayManager.add(RECORD_NAME_1, false);
  expect(overlayManager.getCount()).toBe(1);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, false)).toBe(false);
});

it("one low detail layer, test high detail", () => {
  overlayManager.add(RECORD_NAME_1, false);
  expect(overlayManager.getCount()).toBe(1);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, true)).toBe(true);
});

it("one high detail layer, test high detail", () => {
  overlayManager.add(RECORD_NAME_1, true);
  expect(overlayManager.getCount()).toBe(1);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, true)).toBe(false);
});

it("one low detail layer, test another's low", () => {
  overlayManager.add(RECORD_NAME_1, false);
  expect(overlayManager.getCount()).toBe(1);
  expect(overlayManager.shouldRedraw(RECORD_NAME_2, false)).toBe(true);
});

it("one low detail layer, test another's high", () => {
  overlayManager.add(RECORD_NAME_1, false);
  expect(overlayManager.getCount()).toBe(1);
  expect(overlayManager.shouldRedraw(RECORD_NAME_2, true)).toBe(true);
});

it("two low detail layer, test low detail", () => {
  overlayManager.add(RECORD_NAME_1, false);
  overlayManager.add(RECORD_NAME_2, false);
  expect(overlayManager.getCount()).toBe(2);
  expect(overlayManager.shouldRedraw(RECORD_NAME_1, false)).toBe(false);
});

it("two low detail layer, test high detail", () => {
  overlayManager.add(RECORD_NAME_1, false);
  overlayManager.add(RECORD_NAME_2, false);
  expect(overlayManager.getCount()).toBe(2);
  expect(overlayManager.shouldRedraw(RECORD_NAME_2, true)).toBe(true);
});

it("test clear", () => {
  overlayManager.add(RECORD_NAME_1, false);
  overlayManager.add(RECORD_NAME_2, false);
  expect(overlayManager.getCount()).toBe(2);
  overlayManager.clear();
  expect(overlayManager.getCount()).toBe(0);
});

it("TTT", () => {
  let a = {};
  expect(a["XXX"] === null);
});
