import React, { Component } from 'react';
import { TraceTypes } from '../common/Models.js';
//import $ from 'jquery';
import "../../resources/FilterBox.css";
import GPX from 'gpx-parser-builder';

function readGPXFile(strGPX) {
  const gpx = GPX.parse(strGPX);
  window.console.dir(gpx.metadata);
  window.console.dir(gpx.wpt);
  window.console.dir(gpx.trk);
}

class UploadBox extends Component {

  onChangeHandler = this.onChangeHandler.bind(this);
  onChangeHandler() {
    const selectedFile = document.getElementById('upload').files[0];
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      var textFromFileLoaded = fileLoadedEvent.target.result;
      readGPXFile(textFromFileLoaded);
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
