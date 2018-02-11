import React from 'react';
import {Component} from 'react';
import CKComponent from './Cloud.js';
import {Star, Trace, MarkerType, Coord} from './Models.js';
import SettingManager from './SettingManager.js';
import {MapMapbox, OverlayManager, LoadedAreaManager} from './Map.js';

var settingManager;

class AppMapbox extends Component {

    state = {
	markers: [],
	traces: []
    }
    
    constructor() {
	super();
	
	window.document.write("<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.42.0/mapbox-gl.css' rel='stylesheet' />");



    }

    onMapLoad = this.onMapLoad.bind(this);
    onMapLoad(e) {

    }

    componentDidMount() {
	this.loadedAreaManager = new LoadedAreaManager();
	this.overlayManager = new OverlayManager();
	this.types = [0];
    }

    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleMapBoundsChanged = this.handleMapBoundsChanged.bind(this);
    handleTracesLoad = this.handleTracesLoad.bind(this);

    /** Traces are loaded */
    handleTracesLoad(re) {

	var traces = this.state.traces;

	for (var it in re) {

	    let isDetail = re[it].fields.detail != undefined;
	    if (this.overlayManager.shouldRedraw(re[it].recordName, isDetail)) {
		let pts = re[it].fields.detail == undefined ? re[it].fields.medium.value : re[it].fields.detail.value;

		let trace = Trace(pts, re[it].fields.type.value, re[it].recordName, re[it].zoneRecordName, re[it].share, re[it].fields.linkingId.value);

		for (var it2 in traces) {
		    if (traces[it2].recordName == re[it].recordName) {
			traces.splice(it2, 1);
			break;
		    }
		}
		traces.push(trace);
		this.overlayManager.add(re[it].recordName, isDetail);
	    }
	}


	console.log(traces);
	this.setState({
	    traces: traces
	});
    }    


    /** Login ok */
    handleLoginSuccess() {
	if (window.userIdentity) {
	    //this._ck.loadStars();

	    //this._ck.demoDiscoverUserIdentityWithUserRecordName('_7022d50b9d797f3775d0930d397ceaf4');
	    //this._ck.demoDiscoverAllUserIdentities();

	    var _this = this;
	    this._ck.loadSettings(function(re) {
		if (re.length == 0) {
		    _this._ck.insertSetting(function(re) {
			console.log(re);
		    });
		    
		    var pos = Coord(51.443416, 5.479131);
		    //window.map.panTo(pos);
		    
		    _this.handleMapBoundsChanged();
		}
		else {
		    settingManager = new SettingManager(re[0]);

		    var loc = settingManager.getLastMapLocation();
		    var pos = Coord(loc.latitude, loc.longitude);

		    //window.map.panTo(pos);
		    _this.setState({zoom: settingManager.getLastMapZoom()});

		    //_this.types = settingManager.getTypes();
		    _this.handleMapBoundsChanged();
		}

	    });

	}	
    }

    handleMapBoundsChanged() {

	let _this = this;
	if (this.state.isLoadingTraces) {
	    console.log('loading, skip');
	    return;
	}

	this.setState({isLoadingTraces: true});
	
	let bounds = window.mapbox.getBounds();
	let latDiff = bounds.getNorth() - bounds.getSouth();
	let lngDiff = bounds.getEast() - bounds.getWest();
	
	let maxLat = bounds.getNorth();
	let maxLng = bounds.getEast();
	let minLat = bounds.getSouth();
	let minLng = bounds.getWest();

	let nMaxLat = maxLat + latDiff;
	let nMaxLng = maxLng + lngDiff;
	let nMinLat = minLat - latDiff;
	let nMinLng = minLng - lngDiff;
	
	let z = window.mapbox.getZoom();
	var loadDetail = z > 12;

	if (!this.loadedAreaManager.isLoaded(maxLat, maxLng, minLat, minLng, loadDetail)) {


	    this._ck.loadTraces(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail, this.types, function() {
		_this.setState({isLoadingTraces: false});
		_this.loadedAreaManager.addLoaded(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail);
	    });
	}
	else {
	    console.log('loaded');
	    _this.setState({isLoadingTraces: false});
	}
    }


    render() {
	return (

	    <div>
	      <div className="header-bar">


	      </div>

	      <CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} onStarsLoad={this.handleStarsLoad} onTracesLoad={this.handleTracesLoad}/>	    

		<MapMapbox
		  onLoad={this.onMapLoad}
		  traces={this.state.traces}
		  onViewportChange={(viewport) => {
		      console.log('ssss');
		      this.handleMapBoundsChanged();
		  }}

		  />
	    </div>
	);
    }
}

export default AppMapbox;
