import React, { Component } from 'react';
import {
    MarkedInput,
    MarkedPreview,
    Markedtoolbar } from 'react-markdown-area';

import "./DetailSidebar.css";


export class LiveMarkedArea extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    value: props.defaultValue ? props.defaultValue : ''
	};
    }
    static defaultProps = {
	id: 'mmc-marked-area',
	label: '',
	editMode: false,
	classNames: {
	    root: 'marked-area',
	    header: 'marked-area-header',
	    activeButton: 'marked-area-button active',
	    defaultButton: 'marked-area-button',
	    helpLink: 'marked-area-help-link',
	    textContainer: 'marked-area-text-container',
	    liveDivider: 'marked-area-live-divider'
	}
    };

    componentWillReceiveProps(props) {
	this.setState({value: props.value});
    }

    handleTextChange = (e) => {
	this.setState({value: e.target.value});
    };
    
    render() {
	let {id, label, classNames, placeholder} = this.props;
	let {value} = this.state;
	return (
	    <section className={classNames.root}>

	      <header className={classNames.header}>
		<label htmlFor={id}>{label}</label>
	      </header>

	      {
		  this.props.editMode &&
		      
		  (<MarkedInput
				placeholder={placeholder}
				classNames={classNames}
				onChange={this.handleTextChange}
				value={value} />)
	      }

              <MarkedPreview classNames={classNames}
			     value={value} />

	    </section>
	);
    }
}


class DetailSidebar extends Component {

    constructor(props) {
	super(props);
	console.log(props);
	var state = this.convertProps2State(props);
	state.editMode = false;
	this.state = state;
    }

    convertProps2State(props) {
	if (props.star != null) {
	    var data = props.star.data;

	    return {
		title: data.title.value,
		note: data.note.value,
		type: data.type.value,
		url: (data.url.value == "http://" ? "": data.url.value),
		coordinate: {lat: props.star.position.lat(), lng: props.star.position.lng()}
	    };
	}
    }

    enterEditMode = this.enterEditMode.bind(this);
    cancel = this.cancel.bind(this);
    save = this.save.bind(this);
    
    enterEditMode() {
	this.setState({editMode: true});
    }

    cancel() {
	this.setState({editMode: false});
    }
    save() {

	var star = this.props.star;
	star.title = "SSS";
	console.log(star);
	
	
//	this.setState({editMode: false});
    }

    componentWillReceiveProps(props) {
	this.setState(this.convertProps2State(props));	
    }
    
    render() {
	return (
	    <div className='sidebar-right'>
	      <div className='controls'>
		{ !this.state.editMode ?
		    (<button onClick={this.enterEditMode}>Edit</button>):
		  (<div><button onClick={this.cancel}>Cancel</button> 
		   <button onClick={this.save}>Save</button></div> )
			}
	      </div>
		<h1 className='name'>
		{ !this.state.editMode ?
		  this.state.title :
		  (<input type='text' placeholder='Name' value={this.state.title} />)
		}
	    </h1>
		<ul>
		<li className='address'><span className='label'>ADD</span><span>{this.state.address}</span></li>

		<li className='coords'><span className='label'>COORDS</span><span>{this.state.coordinate.lat.toFixed(6)}, {this.state.coordinate.lng.toFixed(6)}</span></li>

	    {
		    (this.state.editMode == true || this.state.editMode == false && this.state.url != '') &&
			(<li className='url'>
			 <span className='label'>URL</span><span>{ !this.state.editMode ? this.state.url :		  (<input type='text' placeholder='URL' value={this.state.url} />) }
			 </span>
			 
			 </li>)
		}
	    
	    </ul>		    
		<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note}  value={this.state.note} />

	    </div>
	);
    }

}

export default DetailSidebar;
