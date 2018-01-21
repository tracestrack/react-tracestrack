import React, { Component } from 'react';
import {Coord, MarkerType} from './Models.js';
import "./FilterBox.css";

const google = window.google;

class FilterBox extends Component {

    constructor(props) {
	super(props);

    }
    
    render() {
	return (
		<div className='filterBox'>
		<h3>Filter Traces</h3>

		<div>
		<input type="checkbox" id="subscribeNews" name="subscribe" value="newsletter" />
		<label for="subscribeNews">Walking</label>
		</div>

	    		<div>
		<input type="checkbox" id="subscribeNews1" name="subscribe" value="newsletter" />
		<label for="subscribeNews1">Cycling</label>
		</div>


		</div>
	)
    }
    
}

export default FilterBox;
