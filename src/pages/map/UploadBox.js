import React, { Component } from 'react';
import { TraceTypes } from '../common/Models.js';
import "../../resources/FilterBox.css";
import GPX from 'gpx-parser-builder';
import simplify from 'simplify-js';

function transformXYtoLatLng(points) {
  return points.map((t) => {
    return {lat: t.y, lng:  t.x};
  });
}

function processPointsInGPXFile(points) {

  let xypoints = [];
  for (var i in points) {
    xypoints.push({x: parseFloat(points[i].lng), y: parseFloat(points[i].lat)});
  }

  let detail = transformXYtoLatLng(simplify(xypoints, 0.00001, true));
  let medium = transformXYtoLatLng(simplify(xypoints, 0.0001, true));
  let coarse = transformXYtoLatLng(simplify(xypoints, 0.005, true));

  return {detail: detail, medium: medium, coarse: coarse};
}

function createPoint(lat, lng, alt, date) {
  return {lat: lat, lng: lng, alt: alt, date: date};
}

function readGPXFile(strGPX) {
  let points = [];
  const gpx = GPX.parse(strGPX);
  window.console.dir(gpx.metadata);
  //window.console.dir(gpx.wpt);
  let track = gpx.trk[0];
  let title = track['name'];
  let trkpt = track.trkseg[0].trkpt;
  for (var p in trkpt) {
    points.push(createPoint(trkpt[p]["$"].lat, trkpt[p]["$"].lon, trkpt[p]["ele"], trkpt[p]["time"]));
  }

  console.log(title);

  return processPointsInGPXFile(points);
}

class UploadBox extends Component {

  onChangeHandler = this.onChangeHandler.bind(this);
  onChangeHandler() {
    const selectedFile = document.getElementById('upload').files[0];
    let _this = this;
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      let textFromFileLoaded = fileLoadedEvent.target.result;
      let result = readGPXFile(textFromFileLoaded);
      _this.props.onPreview(result);
    };

    fileReader.readAsText(selectedFile, "UTF-8");
  }

  render() {

    return (
      <div className='filterBox'>
        <h3>Upload GPX file</h3>

        <h4>Types</h4>

        {
          Object.keys(TraceTypes()).map((key, index) => (
            <div className="form-check form-check-inline">

              <label className="form-check-label">
                <input className="form-check-input" type="radio" name="selected" value={index} />

                {key}
              </label>
            </div>

          ))
        }

        <h4>File</h4>
        <div className="custom-file">
          <input type="file" name="file" id="upload" onChange={this.onChangeHandler}/>
        </div>

        <div className="box-apply">
          <button type="button" onClick={this.props.onApply} className="btn btn-primary btn-sm">Apply</button>
          <button type="button" onClick={this.props.onCancel} className="btn btn-secondary btn-sm">Cancel</button>
        </div>

      </div>
    );
  }

}

export default UploadBox;
