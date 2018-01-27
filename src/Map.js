import React, { Component } from 'react';
import { DirectionsRenderer, withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";
import { MarkerType } from './Models.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';
import PinImg from './img/pin.png';
import AppleStyle from './mapstyles/apple.json';
import exports from './transformation.js';
import ReactMapGL from 'react-map-gl';

const google = window.google;
const transform = exports;

function getColor(type) {
    switch (type) {
    case 0:
	return '#999505';
    case 1:
	return '#ae41fb';
    case 2:
	return '#ec1313';
    case 3:
	return '#008000';
    case 4:
	return '#045cc8';
    case 5:
	return '#ff8c00';
    case 6:
	return '#447F84';
    }
    return '#000000';
}

export class LoadedAreaManager {

    constructor() {
	this.bboxes = [];
    }

    clear() {
	this.bboxes = [];
    }

    addLoaded(maxLat, maxLng, minLat, minLng, loadDetail) {
	this.bboxes.push([maxLat, maxLng, minLat, minLng, loadDetail]);
    }
    
    isLoaded(maxLat, maxLng, minLat, minLng, loadDetail) {
	for (var it in this.bboxes) {
	    let bit = this.bboxes[it];
	    if (maxLat <= bit[0] && maxLng <= bit[1] && minLat >= bit[2] && minLng >= bit[3] && (bit[4] || !bit[4] && !loadDetail)) {

		return true;
	    }
	}
	return false;
    }
}

export class OverlayManager {

    constructor() {
	this.overlayDict = {};
    }
    
    shouldRedraw(recordName, isDetail) {
	if (this.overlayDict[recordName] == null) {
	    return true;
	}
	return isDetail && !this.overlayDict[recordName];
    }

    add(recordName, isDetail) {
	this.overlayDict[recordName] = isDetail;
    }

    clear() {
	this.overlayDict = {};
    }
    
}

export const Map = withGoogleMap(props => (
    <GoogleMap
      ref={props.onMapMounted}
      defaultOptions={{
	  mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: google.maps.ControlPosition.TOP_RIGHT
	  },
	  styles: AppleStyle,
	  zoomControl: false,
	  clickableIcons: true,
	  fullscreenControl: false,
	  minZoom: 5,
	  maxZoom: 18,
	  streetViewControlOptions: {
              position: google.maps.ControlPosition.BOTTOM_CENTER
	  }
      }}
      
      zoom={props.zoom}
      onClick={props.onMapLeftClick}
      onZoomChanged={props.onZoomChanged}
      onDragEnd={props.onDragEnd}
      onRightClick={props.onMapRightClick}
      >

      {props.directions && <DirectionsRenderer directions={props.directions} options={{
						   draggable: true,
						   preserveViewport: true,
						   suppressBicyclingLayer: true,
						   suppressInfoWindows: true
					       }}/>}
      

      {props.markers.map((marker, index) => {
	  const onClick = () => props.onMarkerClick(marker);

	  let position = new google.maps.LatLng(
	      marker.coord.lat, marker.coord.lng
	  );

	  var icon;
	  
	  switch (marker.type) {
	  case MarkerType.red:
	      icon = {url: RedStarImg, scaledSize: new google.maps.Size(16, 16)};
	      break;
	  case MarkerType.green:
	      icon = {url: GreenStarImg, scaledSize: new google.maps.Size(16, 16)};
	      break;
	  case MarkerType.searchHit:
	      icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
	      break;
	  case MarkerType.new:
	      //icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
	      break;
	  }
	  
	  return (
	      <Marker
		key={index}
		icon={icon}
		position={position}
		title={(index + 1).toString()}
		onClick={onClick}
		>
	      </Marker>
	  );
      })}
    
    {props.traces.map((trace, index) => {
	const onClick = () => props.onTraceClick(trace);
	
	var coords = [];

	for (var i = 0; i < trace.detail.length; i += 2) {

	    let gcj = transform.wgs2gcj(trace.detail[i]/1000000,trace.detail[i + 1]/1000000);
	    coords.push({
		lat: gcj.lat,
		lng: gcj.lng
	    });
	}
	
	var opt = {
	    strokeColor: getColor(trace.type),
	    strokeOpacity: 0.7,
	    strokeWeight: trace.selected ? 5 : 2
	};

	return (
	    <Polyline
	      key={index}
	      path={coords}
	      options={opt}
	      onClick={onClick}
	      />
	);
    })}
    </GoogleMap>
));


export class MapMapbox extends Component {

    
    updateWindowDimensions = this.updateWindowDimensions.bind(this);

    componentDidMount() {
	this.updateWindowDimensions();
	window.addEventListener('resize', this.updateWindowDimensions);
	this.tracesRN = [];
    }

    componentWillUnmount() {
	window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
	var s = this.state.viewport;
	
	this.setState({
	    viewport: {
		width: window.innerWidth,
		height: window.innerHeight,
		latitude: s.latitude,
		longitude: s.longitude,
		zoom: s.zoom
		
	    }

	});
    }

    componentWillReceiveProps(props) {
	this.updateTrace();
    }

    updateTrace = this.updateTrace.bind(this);
    
    updateTrace() {

	for (var it in this.props.traces) {
	    var trace = this.props.traces[it];

	    if (this.tracesRN.indexOf(trace.recordName) > -1) {
		continue;
	    }

	    this.tracesRN.push(trace.recordName);
	    
	    console.log(trace);

	    var coords = [];
	    for (var k = 0; k < trace.detail.length; k += 2) {
		coords.push([trace.detail[k+1] / 1000000, trace.detail[k] / 1000000]);
	    }
	    console.log(coords);

	    window.mapbox.addLayer({
		"id": trace.recordName,
		"type": "line",
		"source": {
		    "type": "geojson",
		    "data": {
			"type": "Feature",
			"properties": {},
			"geometry": {
			    "type": "LineString",
			    "coordinates": coords
			}
		    }
		},
		"layout": {
		    "line-join": "round",
		    "line-cap": "round"
		},
		"paint": {
		    "line-color": "red",
		    "line-width": 1
		}
	    });
	}
    }
    
    
    state = {
	viewport: {
	    width: 100,
	    height: 100,
	    latitude: 51.445716,
	    longitude: 5.4731112,
	    zoom: 14
	}
    };
    
    render() {
	return (

	    <ReactMapGL
	      ref={(m) => {if (m) {window.mapbox = m.getMap();}}} 
	      mapStyle="mapbox://styles/strongwillow/cjcx32d7y0rjn2qnwgkoy6ebh"
	      onLoad={this.updateTrace}
	      mapboxApiAccessToken="pk.eyJ1Ijoic3Ryb25nd2lsbG93IiwiYSI6ImxKa2R1SEkifQ.iZ_vj1lvuvrAcUIl0ZE5XA"
	      {...this.state.viewport}
	      onViewportChange={(viewport) => {
		      this.setState({viewport});
		      this.props.onViewportChange(viewport);
		      }
		  }
		  />

	);
    };
}
