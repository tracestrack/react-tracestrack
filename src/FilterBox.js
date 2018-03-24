import React, { Component } from 'react';
import {Types, Coord, MarkerType} from './Models.js';
import "./FilterBox.css";

const google = window.google;
const $ = window.$;

class FilterBox extends Component {

    constructor(props) {
	super(props);
    }

    handleApplyFilter = this.handleApplyFilter.bind(this);

    handleApplyFilter() {
	var b = [];
	window.$("[name='selected']:checked").each( function () {
	    b.push(parseInt(window.$(this).val()));
	});
	this.props.onFilterApply(b);
    }
    
    render() {
	const {vals} = Types();

	return (
		<div className='filterBox'>
		<h3>Filter Traces</h3>

		<h4>Types</h4>

	    {
		Object.keys(Types()).map((key, index) => (
			<div className="form-check form-check-inline">
			
			<label className="form-check-label">
			<input className="form-check-input" type="checkbox" name="selected" value={index} defaultChecked={this.props.types.indexOf(index) > -1}/>

		    {key}
		    </label>
			</div>

		))

	    }


	    <div className="box-apply">
		<button type="button" onClick={this.handleApplyFilter} className="btn btn-primary btn-sm">Apply</button>

		<button type="button" onClick={this.props.onCancel} className="btn btn-secondary btn-sm">Cancel</button>
</div>

		</div>
	);
    }
    
}

export default FilterBox;
