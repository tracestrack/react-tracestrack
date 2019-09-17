import React, { Component } from 'react';
import { TraceTypes, CKTraceModel } from '../common/Models.js';
import { formatDate, formatDistance, formatDuration, formatSpeed } from '../../utils/Formatter.js';
import "../../resources/UploadBox.css";
import GPX from 'gpx-parser-builder';
import { createPoint, processPointsInGPXFile, getTimezoneOffset, calculateDistanceOfTrace, calculateDuration,
       calculateAvgSpeed} from "./UploadModel.js";

function readGPXFile(strGPX) {
  let points = [];
  const gpx = GPX.parse(strGPX);
  let track = gpx.trk[0];
  let title = track['name'];
  let date = gpx['metadata']['time'];
  
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
  model.startDate = date;
  model.distance = calculateDistanceOfTrace(points);
  model.duration = calculateDuration(points);
  model.averageSpeed = calculateAvgSpeed(points);
  
  let firstPt = simplifiedPoints.detail[0];
  model.secondsFromGMT = getTimezoneOffset(firstPt.lat, firstPt.lng) * 60;

  return model;
}

class UploadBox extends Component {

  state = {
    title: ""
  };
  
  onChangeHandler = this.onChangeHandler.bind(this);
  onChangeHandler() {
    const selectedFile = document.getElementById('upload').files[0];
    
    let _this = this;
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      let textFromFileLoaded = fileLoadedEvent.target.result;
      let ckTraceModel = readGPXFile(textFromFileLoaded);

      let date = new Date(ckTraceModel.startDate.getTime() + ckTraceModel.secondsFromGMT * 1000);
      console.log(ckTraceModel.startDate);
      console.log(date);

      _this.setState({title: ckTraceModel.title,
                      date: formatDate(date),
                      distance: formatDistance(ckTraceModel.distance),
                      duration: formatDuration(ckTraceModel.duration),
                      avgSpeed: formatSpeed(ckTraceModel.averageSpeed)
                     });
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
          <button type="button" onClick={this.props.onApply} className="btn btn-primary btn-sm">Upload</button>
          <button type="button" onClick={this.props.onCancel} className="btn btn-secondary btn-sm">Cancel</button>
        </div>

      </div>
    );
  }

}

export default UploadBox;
