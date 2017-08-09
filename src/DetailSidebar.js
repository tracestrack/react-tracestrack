import React, { Component } from 'react';
import { LiveMarkedArea, MarkedPreview } from 'react-markdown-area';

import "./DetailSidebar.css";

class DetailSidebar extends Component {

    constructor(props) {
	super(props);
	this.state = {
	    value: "# Hello World! `This is markdown` **thank** *you!*",
	    title: "Title",
	    address: "The address",
	    coordinate: {lat: 52.111, lng: 2.213},
	    url: "https://www.google.com"
	};
    }
    
    render() {
	return (
		<div className='sidebar-right'>
		<h1>{this.state.title}</h1>
		<ul>
		<li>{this.state.address} </li>
		<li>{this.state.coordinate.lat}, {this.state.coordinate.lng}</li>
		<li>{this.state.url} </li>		
		</ul>
		<LiveMarkedArea className='textarea' label="Notes in Markdown" defaultValue={this.state.value} />

		</div>
	);
    }

}

export default DetailSidebar;
