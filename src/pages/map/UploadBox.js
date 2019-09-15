import React, { Component } from 'react';
import { TraceTypes, CKTraceModel } from '../common/Models.js';
import "../../resources/UploadBox.css";
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

  let simplifiedPoints = processPointsInGPXFile(points);
  let model = CKTraceModel();
  model.title = title;
  model.detail = simplifiedPoints.detail;
  model.medium = simplifiedPoints.medium;
  model.coarse = simplifiedPoints.coarse;

  return model;
}

class UploadBox extends Component {

  state = {
    title: "Undefined title"
  };
  
  onChangeHandler = this.onChangeHandler.bind(this);
  onChangeHandler() {
    const selectedFile = document.getElementById('upload').files[0];
    let _this = this;
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      let textFromFileLoaded = fileLoadedEvent.target.result;
      let ckTraceModel = readGPXFile(textFromFileLoaded);
      _this.setState({title: ckTraceModel.title});
      _this.props.onPreview(ckTraceModel);
    };

    fileReader.readAsText(selectedFile, "UTF-8");
  }

  render() {

    return (
      <div className='uploadBox'>
        <h3>Upload GPX file</h3>

        <h4>Select a local GPX file</h4>
        <div className="custom-file">
          <input type="file" name="file" id="upload" onChange={this.onChangeHandler}/>
        </div>
        
        <h4>Trace Information</h4>
        <table className="table">
          <tbody>
            <tr>
              <td>Title</td>
              <td>
                <input type="text" value={this.state.title} />
              </td>
            </tr>
            <tr>
              <td>Type</td>
              <td>
                <select className="form-control" id="exampleFormControlSelect1">
                  {
                    Object.keys(TraceTypes()).map((key, index) => (
                      <option value={index}>{key}</option>
                    ))
                  }
                </select>
              </td>
            </tr>
            <tr>
              <td>Start Time</td>
              <td>

              </td>
            </tr>
            <tr>
              <td>Distance</td>
              <td>

              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>

              </td>
            </tr>
            <tr>
              <td>Avg. Speed</td>
              <td>

              </td>
            </tr>
          </tbody>
        </table>

        <div className="box-apply">
          <button type="button" onClick={this.props.onApply} className="btn btn-primary btn-sm">Upload</button>
          <button type="button" onClick={this.props.onCancel} className="btn btn-secondary btn-sm">Cancel</button>
        </div>

      </div>
    );
  }

}

export default UploadBox;
