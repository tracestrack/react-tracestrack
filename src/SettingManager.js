class SettingManager {
  constructor(re) {
      this.record = re;
      
      if (re.fields.lastMapLocation == null || re.fields.lastMapLocation.value == null) {
	  this.lastMapLocation = {latitude: 51.443416, longitude: 5.479131};
      }
      else {
	  this.lastMapLocation = re.fields.lastMapLocation.value;
      }
      
      if (re.fields['types']) {
	  this.types = re.fields['types'].value;
      }
      if (re.fields.lastMapZoom) {
	  this.lastMapZoom = re.fields.lastMapZoom.value;
      }
  }

    getLastMapLocation() {
	return this.lastMapLocation;
    }

    getTypes() {
	if (this.types == null) {
	    return [0,1,2,3,4,5,6];
	}
	else {
	    return this.types;
	}
    }

    getLastMapZoom() {
	return (this.lastMapZoom ? this.lastMapZoom : 10);
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
