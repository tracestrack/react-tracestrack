import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';

class Manage extends React.Component {

    handleLoginSuccess = this.handleLoginSuccess.bind(this);

    handleLoginSuccess() {
	if (window.userIdentity) {
	    this._ck.loadTracesOrderByDate(function(records) {

		for (var i in records) {
		    console.log(records[i].fields.path);
		}		
	    });
	}	
    }


    render() {
	return (
		<div>

		<CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='activities' />

	    activity list

		<SiteFooter />
		</div>
	);
    }
}


export default Manage;
