class SettingManager {
  constructor(re) {
      this.record = re;
      
      this.lastMapLocation = re.fields.lastMapLocation;
      if (re.fields['types']) {
	  this.types = re.fields['types'].value;
      }
      if (re.fields.lastMapZoom) {
	  this.lastMapZoom = re.fields.lastMapZoom.value;
      }
  }

    getLastMapLocation() {
	if (this.lastMapLocation == null) {
	    return {latitude: 51.443416, longitude: 5.479131};
	}
	else {
	    return this.lastMapLocation.value;
	}
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

	console.log(this.getLastMapLocation());
	this.record.fields = {
	    lastMapLocation: this.getLastMapLocation(),
	    lastMapZoom: this.getLastMapZoom(),
	    types: this.getTypes(),	    
	};

	return this.record;
    }

}

export default SettingManager;
