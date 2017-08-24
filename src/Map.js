import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";
import { MarkerType } from './App.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';
import PinImg from './img/pin.png';


const google = window.google;

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
}

export const Map = withGoogleMap(props => (
    <GoogleMap
      ref={props.onMapMounted}
      defaultOptions={{
	  mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DEFAULT,
              position: google.maps.ControlPosition.TOP_LEFT
	  },
	  zoomControl: false,
	  streetViewControlOptions: {
              position: google.maps.ControlPosition.BOTTOM_CENTER
	  }
      }}
      defaultZoom={14}
      defaultCenter={{ lat: 51.447698, lng: 5.487497 }}
      onClick={props.onMapLeftClick}
      onRightClick={props.onMapRightClick}
      >
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
	      icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
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

	    coords.push({
		lat: trace.detail[i]/1000000,
		lng: trace.detail[i + 1]/1000000
	    });
	}
	
	var opt = {
	    strokeColor: getColor(trace.type),
	    strokeOpacity: 0.7,
	    strokeWeight: 2
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
