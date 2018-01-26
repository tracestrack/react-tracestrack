import React from 'react'
import {Component} from 'react';
import ReactMapGL from 'react-map-gl';

class Map2 extends Component {

    constructor() {
	super();
	
	window.document.write("<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.42.0/mapbox-gl.css' rel='stylesheet' />");

	this._map = {};
    }

    onMapLoad = this.onMapLoad.bind(this);
    onMapLoad(e) {

	this._map.addLayer({
	    "id": "route",
	    "type": "line",
	    "source": {
		"type": "geojson",
		"data": {
		    "type": "Feature",
		    "properties": {},
		    "geometry": {
			"type": "LineString",
			"coordinates": [
			    [-122.48369693756104, 37.83381888486939],
			    [-122.48348236083984, 37.83317489144141],
			    [-122.48339653015138, 37.83270036637107],
			    [-122.48356819152832, 37.832056363179625],
			    [-122.48404026031496, 37.83114119107971],
			    [-122.48404026031496, 37.83049717427869],
			    [-122.48348236083984, 37.829920943955045],
			    [-122.48356819152832, 37.82954808664175],
			    [-122.48507022857666, 37.82944639795659],
			    [-122.48610019683838, 37.82880236636284],
			    [-122.48695850372314, 37.82931081282506],
			    [-122.48700141906738, 37.83080223556934],
			    [-122.48751640319824, 37.83168351665737],
			    [-122.48803138732912, 37.832158048267786],
			    [-122.48888969421387, 37.83297152392784],
			    [-122.48987674713133, 37.83263257682617],
			    [-122.49043464660643, 37.832937629287755],
			    [-122.49125003814696, 37.832429207817725],
			    [-122.49163627624512, 37.832564787218985],
			    [-122.49223709106445, 37.83337825839438],
			    [-122.49378204345702, 37.83368330777276]
			]
		    }
		}
	    },
	    "layout": {
		"line-join": "round",
		"line-cap": "round"
	    },
	    "paint": {
		"line-color": "yellow",
		"line-width": 3
	    }
	});

    }

    updateWindowDimensions = this.updateWindowDimensions.bind(this);

    componentDidMount() {
	this.updateWindowDimensions();
	window.addEventListener('resize', this.updateWindowDimensions);


    }

    componentWillUnmount() {
	window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
	var s = this.state.viewport;
	
	this.setState({ viewport: {
	    width: window.innerWidth,
	    height: window.innerHeight,
	    latitude: s.latitude,
	    longitude: s.longitude,
	    zoom: s.zoom
	    
	}
		      });
    }

    state = {
	viewport: {
	    width: 100,
	    height: 100,
	    latitude: 37.7577,
	    longitude: -122.4376,
	    zoom: 8
	}
    };

    render() {
	return (

		<div>
		<div className="header-bar">


	    </div>

	    
	        <ReactMapGL
	    ref={(m) => {if (m) {this._map = m.getMap();}}} 
	    onLoad={this.onMapLoad}
	    mapboxApiAccessToken="pk.eyJ1Ijoic3Ryb25nd2lsbG93IiwiYSI6ImxKa2R1SEkifQ.iZ_vj1lvuvrAcUIl0ZE5XA"
            {...this.state.viewport}
            onViewportChange={(viewport) => this.setState({viewport})}
		/>

	    </div>
	);
    }
}

export default Map2;
