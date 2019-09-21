import { formatGPXDownloadFilename } from '../utils/Formatter.js';

it("test formatGPXdownloadfilename", () => {
  [
    ["", "Unnamed.gpx"],
    ["Morning Run", "Morning Run.gpx"],
    ["晨跑", "晨跑.gpx"],
    ["晨跑", "晨跑.gpx"],
    ["\\a!.test*", "a!.test.gpx"],
    ["I/?\" love you", "I love you.gpx"]
  ].forEach((ele) => {
    expect(formatGPXDownloadFilename(ele[0])).toBe(ele[1]);
  });
});
