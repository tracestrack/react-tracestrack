'strict';
//import CloudDatastore from '../../datastore/Mock.js';
import CloudDatastore from '../../datastore/CloudDatastore.js';

class SettingManager {
  constructor(done) {
    var _this = this;
    CloudDatastore.getSettings().then(
      result => {
        let re = result.records[0];
        _this.record = re;
        if (!re) {
          done();
          return;
        }

        if ('lastMapLocation' in re.fields && re.fields['lastMapLocation'].value !== null) {
          _this.lastMapLocation = re.fields.lastMapLocation.value;
        }
        
        if (re.fields['types'] !== null && re.fields['types'].value !== null) {
          _this.types = re.fields['types'].value;
        }

        if ('lastMapZoom' in re.fields) {
          _this.lastMapZoom = re.fields.lastMapZoom.value;
        }

        done();
      }
    );    
  }

  getLastMapLocation() {
    return this.lastMapLocation ? this.lastMapLocation : {latitude:  48.862427, longitude: 2.338650};
  }

  getTypes() {
    return this.types ? this.types : [0,1,2,3,4,5,6];
  }

  getLastMapZoom() {
    return this.lastMapZoom ? this.lastMapZoom : 10;
  }

  packRecord() {

    let record = {};
    if (this.record !== undefined) {
      record = this.record;
    }
    else {
      record = {recordName: "", recordType: "Setting", fields: {}};
    }
    
    record.fields = {
      lastMapLocation: this.getLastMapLocation(),
      lastMapZoom: this.getLastMapZoom(),
      types: this.getTypes()
    };

    return record;
  }

}

export default SettingManager;
