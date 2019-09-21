import React, { Component } from 'react';
import { TraceTypes, CKTraceModel } from '../common/Models.js';
import { formatDate, formatDistance, formatDuration, formatSpeed } from '../../utils/Formatter.js';
import "../../resources/UploadBox.css";
import $ from "jquery";
import GPX from 'gpx-parser-builder';
import { createPoint, processPointsInGPXFile, getTimezoneOffset, calculateDistanceOfTrace, calculateDuration,
         calculateAvgSpeed, calculateLowAlt, calculateHighAlt, calculateElevation,
         calculateBoundingBox, calculateSHA256
       } from "./UploadModel.js";

function getType() {
  return parseInt($("#typeSelector").val());
}

function readGPXFile(strGPX) {
  let points = [];
  const gpx = GPX.parse(strGPX);
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
  model.startDate = new Date(points[0].date).getTime();
  model.distance = calculateDistanceOfTrace(points);
  model.duration = calculateDuration(points);
  model.averageSpeed = calculateAvgSpeed(points);
  model.lowAlt = calculateLowAlt(points);
  model.highAlt = calculateHighAlt(points);
  model.elevation = calculateElevation(points);
  model.linkingId = 0;
  model.note = "";
  model.hashString = calculateSHA256(strGPX);
  let bbox = calculateBoundingBox(points);
  model.maxLat = bbox.maxLat;
  model.maxLng = bbox.maxLng;
  model.minLat = bbox.minLat;
  model.minLng = bbox.minLng;

  let firstPt = points[0];
  model.secondsFromGMT = getTimezoneOffset(firstPt.lat, firstPt.lng) * 60;

  return model;
}

class UploadBox extends Component {

  state = {
    title: ""
  };

  onChangeHandler = this.onChangeHandler.bind(this);
  onChangeHandler(event) {
    const selectedFile = event.target.files[0];

    let _this = this;
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      let textFromFileLoaded = fileLoadedEvent.target.result;
      let ckTraceModel = readGPXFile(textFromFileLoaded);

      let date = new Date(ckTraceModel.startDate + ckTraceModel.secondsFromGMT * 1000);

      _this.setState({title: ckTraceModel.title,
                      date: formatDate(date),
                      distance: formatDistance(ckTraceModel.distance),
                      duration: formatDuration(ckTraceModel.duration),
                      avgSpeed: formatSpeed(ckTraceModel.averageSpeed)
                     });

      ckTraceModel.gpxFile = selectedFile;
      _this.ckTraceModel = ckTraceModel;
      _this.props.onPreview(ckTraceModel);
    };

    fileReader.readAsText(selectedFile, "UTF-8");
  }

  onApply = this.onApply.bind(this);
  onApply(event) {
    this.ckTraceModel.title = $("#traceName").val();
    this.ckTraceModel.type = getType();
    this.props.onApply(this.ckTraceModel);
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
                <input type="text" id="traceName" defaultValue={this.state.title} />
              </td>
            </tr>
            <tr>
              <td>Type</td>
              <td>
                <select className="form-control" id="typeSelector">
                  {
                    Object.keys(TraceTypes()).map((key, index) => (
                      <option key={index} value={index}>{key}</option>
                    ))
                  }
                </select>
              </td>
            </tr>
            <tr>
              <td>Start Time</td>
              <td>
                {this.state.date}
              </td>
            </tr>
            <tr>
              <td>Distance</td>
              <td>
                {this.state.distance}
              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>
                {this.state.duration}
              </td>
            </tr>
            <tr>
              <td>Avg. Speed</td>
              <td>
                {this.state.avgSpeed}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="box-apply">
          <button type="button" onClick={this.onApply} className="btn btn-primary btn-sm">Upload</button>
          <button type="button" onClick={this.props.onCancel} className="btn btn-secondary btn-sm">Cancel</button>
        </div>

        <span className="badge badge-info">Tip: Refresh the page to show the uploaded trace</span>
      </div>
    );
  }

}

export default UploadBox;
