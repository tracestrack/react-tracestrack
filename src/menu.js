import React, { Component } from 'react';
import './menu.css';
import PropTypes from 'prop-types';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

class AccountDropdown extends Component {

    constructor (props) {
	super(props);

	this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    handleLinkClick () {
	this.refs.dropdown.hide();
    }

    render () {

	return (
		<Dropdown active={this.props.active} style={{left: this.props.position.left, top: this.props.position.top}}>

                <DropdownContent>

		<a href="/profile">Add Red Star</a>
                <a href="/favorites">Add Green Star</a>
                <a href="/logout">Find Nearby Wikis</a>
		
            </DropdownContent>
		</Dropdown>

	);
    }
}


export default AccountDropdown;
