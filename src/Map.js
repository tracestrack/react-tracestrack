import React from "react";
import Component from "react";

import { DirectionsRenderer, withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";
import { MarkerType } from './Models.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';
import AppleStyle from './mapstyles/apple.json';
import exports from './transformation.js';
import ReactMapGL from 'react-map-gl';

import { compose, withProps } from "recompose";

const google = window.google;
const transform = exports;

var visited = false;

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

    getCount() {
	return Object.keys(this.overlayDict).length;
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

    remove(recordName) {
	delete this.overlayDict[recordName];
    }

    clear() {
	this.overlayDict = {};
    }
}

export const Map = withScriptjs(withGoogleMap((props) =>

  <GoogleMap
  ref={props.onMapMounted}
  defaultOptions={{
      mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      styles: AppleStyle,
      zoomControl: true,
      clickableIcons: true,
      fullscreenControl: false,
      minZoom: 8,
      maxZoom: 18,
      streetViewControlOptions: {
          position: window.google.maps.ControlPosition.BOTTOM_CENTER
      }
  }}
  
  zoom={props.zoom}
  onClick={props.onMapLeftClick}
  onZoomChanged={props.onZoomChanged}
  onDragEnd={props.onDragEnd}
  onRightClick={props.onMapRightClick}
  >


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
  
  {props.markers.map((marker, index) => {
      const onClick = () => props.onMarkerClick(marker);

      let position = new window.google.maps.LatLng(
	  marker.coord.lat, marker.coord.lng
      );

      if (window.map.getBounds().contains(position) == false) {
	  return;
      }

      var icon;
      
      switch (marker.type) {
      case MarkerType.red:
	  icon = {url: RedStarImg, scaledSize: new window.google.maps.Size(24, 24)};
	  console.log("type red");
	  break;
      case MarkerType.green:
	  icon = {url: GreenStarImg, scaledSize: new window.google.maps.Size(24, 24)};
	  console.log("type green");
	  break;
      case MarkerType.searchHit:
	  //icon = {url: PinImg, scaledSize: new window.google.maps.Size(32, 32)};
	  break;
      case MarkerType.new:
	  //icon = {url: PinImg, scaledSize: new window.google.maps.Size(48, 48)};
	  break;
      };

      return (
	      <Marker
	  key={marker.recordName}
	  icon={icon}
	  position={position}
	  title={(index + 1).toString()}
	  onClick={onClick}
	      >
	      </Marker>
      );
  })}


  </GoogleMap>
));

export class MapMapbox extends React.Component {

    
    updateWindowDimensions = this.updateWindowDimensions.bind(this);

    componentDidMount() {
	this.updateWindowDimensions();
	window.addEventListener('resize', this.updateWindowDimensions);
	this.tracesRN = [];

	this.style = {
        "version": 8,
        "sources": {
            "raster-tiles": {
                "type": "raster",
                "url": "mapbox://mapbox.streets",
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "simple-tiles",
            "type": "raster",
            "source": "raster-tiles",
            "minzoom": 6,
            "maxzoom": 17
        }]
	};

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

	    var coords = [];
	    for (var k = 0; k < trace.detail.length; k += 2) {
		coords.push([trace.detail[k+1] / 1000000, trace.detail[k] / 1000000]);
	    }

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
		    'line-opacity': .4,
		    "line-width": 2
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
		  mapStyle={this.style}
	    onLoad={this.updateTrace}
		  minZoom={6}
		  maxZoom={16}
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
