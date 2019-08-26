import React, { Component } from 'react';
import { Types } from '../common/Models.js';
//import $ from 'jquery';
import "../../resources/FilterBox.css";

class UploadBox extends Component {

  render() {

    return (
      <div className='filterBox'>
        <h3>Upload GPX file</h3>

        <h4>Types</h4>

        {
          Object.keys(Types()).map((key, index) => (
            <div className="form-check form-check-inline">

              <label className="form-check-label">
                <input className="form-check-input" type="checkbox" name="selected" value={index} />

                {key}
              </label>
            </div>

          ))
        }
    
        <div className="box-apply">
          <button type="button" className="btn btn-primary btn-sm">Apply</button>
        </div>

      </div>
    );
  }

}

export default UploadBox;
