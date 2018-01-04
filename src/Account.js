import React, { Component } from 'react';
import CKComponent from './Cloud.js';

export class SiteHeader extends React.Component {

    constructor(props) {
	super(props);

	console.log(props);
	this.state = {selected: props.selected};
    }
    
    render() {
	return (
	    <header className="masthead">
	      <div className="inner">
		<h3 className="masthead-brand">Traces</h3>
		<nav className="nav nav-masthead">
                  <a className="nav-link" href="http://traces.website">Home</a>
                  <a className="nav-link" href="/">Map</a>
		  {
		      (this.state.selected=='account') && 
			  (<a className="nav-link active" href="/account">Account</a>)
			  ||
			  (<a className="nav-link " href="/account">Account</a>)
		  }

	    {
		      (this.state.selected=='activities') && 
			  (<a className="nav-link active" href="/activies">Activities</a>)
			  ||
			  (<a className="nav-link " href="/activies">Activities</a>)
		  }
	    
                <a className="nav-link" href="http://traces.website/help">Help</a>
		</nav>
		</div>
		</header>
	);
    }
}

export class SiteFooter extends React.Component {
    render() {
	return (

	    <div className="mw-100">
	      
	      <footer className="mastfoot">
		<div className="inner">
		  <p>Traces App since 2015, maintained by Qing Cai</p>
		</div>
	      </footer>

            </div>
	);
    }
}


class Account extends React.Component {

    constructor(props) {
	super(props);

	this.state = {signedIn: false};
    }


    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleLoginSuccess() {
	window.$("#apple-sign-in-button").hide();
	window.$("#apple-sign-out-button").show();
	this.setState({signedIn: true});
    }

    render() {
	return (
	    <div>

	      <CKComponent onLoginSuccess={this.handleLoginSuccess} />
	      <SiteHeader selected='account' />

	      <div className="signinout">

		<img src='signin-icloud.png' />

		<div id='apple-sign-in-button'></div>
		<div id='apple-sign-out-button'></div>

		{ (this.state.signedIn === false) &&
		    (<p>All your data is saved in Apple's iCloud. You are the only one who have access to your data. For more information, visit <a href='https://www.apple.com//icloud/'>iCloud intro page</a>.</p>)
		  ||
		  (<p><button>Go to Map</button></p>)
		}

	    </div>


		<SiteFooter />
		</div>
	);
    }
}

export default Account;
