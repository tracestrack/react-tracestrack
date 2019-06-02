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
        
        if (re.fields['lastMapLocation'] !== null && re.fields['lastMapLocation'].value !== null) {
          _this.lastMapLocation = re.fields.lastMapLocation.value;
        }
        
        if (re.fields['types'] !== null && re.fields['types'].value !== null) {
          _this.types = re.fields['types'].value;
        }

        if (re.fields['lastMapZoom'] !== null) {
          _this.lastMapZoom = re.fields.lastMapZoom.value;
        }

        done();
      }
    );    
  }

  getLastMapLocation() {
    return this.lastMapLocation ? this.lastMapLocation : {latitude: 1, longitude: 1};
  }

  getTypes() {
    return this.types ? this.types : [0,1,2,3,4,5,6];
  }

  getLastMapZoom() {
    return this.lastMapZoom ? this.lastMapZoom : 10;
  }

  packRecord() {
    this.record.fields = {
      lastMapLocation: this.getLastMapLocation(),
      lastMapZoom: this.getLastMapZoom(),
      types: this.getTypes()
    };

    return this.record;
  }

}

export default SettingManager;
