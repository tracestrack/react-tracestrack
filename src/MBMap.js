import React from 'react'
import {Component} from 'react';
import ReactMapGL from 'react-map-gl';

class Map2 extends Component {

    constructor() {
	super();
	
	window.document.write("<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.42.0/mapbox-gl.css' rel='stylesheet' />");
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

sdfd

		</div>

		
	        <ReactMapGL
	    mapboxApiAccessToken="pk.eyJ1Ijoic3Ryb25nd2lsbG93IiwiYSI6ImxKa2R1SEkifQ.iZ_vj1lvuvrAcUIl0ZE5XA"
            {...this.state.viewport}
            onViewportChange={(viewport) => this.setState({viewport})}
		/>

	    </div>
	);
    }
}

export default Map2;
