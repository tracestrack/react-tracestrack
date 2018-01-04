import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';

class Manage extends React.Component {
    render() {
	return (
		<div>
		<SiteHeader selected='activities' />


		<SiteFooter />
		</div>
	);
    }
}


export default Manage;
