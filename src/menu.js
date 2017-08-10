import React, { Component } from 'react';
import './menu.css';
import PropTypes from 'prop-types';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

class Menu extends Component {

    constructor (props) {
	super(props);
	this.state = {active: false};
    }

    componentWillReceiveProps(props) {
	this.setState({
	    active: props.active
	});	
    }

    addStar = this.addStar.bind(this);

    addStar() {
	this.setState({active: false});
    }

    render () {

	return (
		<Dropdown active={this.state.active} style={{left: this.props.position.left, top: this.props.position.top}}>

                <DropdownContent>

		<a onClick={this.addStar}>Add Star</a>
                <a onClick={this.showAttractions}>Show Nearby Attractions</a>
                <a onClick={this.showRestaurants}>Show Nearby Restaurants</a>		
                <a onClick={this.showWikis}>Show Nearby Wikis</a>
		
            </DropdownContent>
		</Dropdown>

	);
    }
}


export default Menu;
