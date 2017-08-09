import React, { Component } from 'react';
import { LiveMarkedArea, MarkedPreview } from 'react-markdown-area';

import "./DetailSidebar.css";

class DetailSidebar extends Component {

    constructor(props) {
	super(props);
	this.state = {
	    value: "HI"
	};
    }
    
    render() {
	return (
		<div className='sidebar-right'>
		<LiveMarkedArea className='textarea' label="Notes in Markdown" defaultValue="# Hello World! `This is markdown` **thank** *you!*" />

		</div>
	);
    }

}

export default DetailSidebar;
