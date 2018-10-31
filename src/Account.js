import React, { Component } from 'react';
import CKComponent from './Cloud.js';

const lang = window.lang;

export class SiteHeader extends React.Component {

    constructor(props) {
	super(props);

	console.log(props);
	this.state = {selected: props.selected};
    }


    switchEn = this.switchEn.bind(this);
    switchEn() {
	window.localStorage.setItem('lang', 'en');
    }
    
    switchZh = this.switchZh.bind(this);
    switchZh() {
	window.localStorage.setItem('lang', 'zh-cn');
    }

    render() {
	return (
	    <header className="masthead">
	      <div className="inner">
		<h3 className="masthead-brand">Traces</h3>
		<nav className="nav nav-masthead">
                <a className="nav-link" href="/">{lang.home}</a>
                <a className="nav-link" href="/map">{lang.map}</a>
		  {
		      (this.state.selected=='account') && 
			  (<a className="nav-link active" href="/account">{lang.account}</a>)
			  ||
			  (<a className="nav-link " href="/account">{lang.account}</a>)
		  }

	    {
		      (this.state.selected=='activities') && 
		    (<a className="nav-link active" href="/activities">{lang.activities}</a>)
			  ||
		    (<a className="nav-link " href="/activities">{lang.activities}</a>)
		  }
	    
	    {
		      (this.state.selected=='stars') && 
		    (<a className="nav-link active" href="/stars">{lang.stars}</a>)
			  ||
		    (<a className="nav-link " href="/stars">{lang.stars}</a>)
		  }
	    
                <a className="nav-link" href="/help">{lang.help}</a>



	    </nav>
		<div className="lang-box">

                <a href="" onClick={this.switchEn}>English</a>
                <a href="" onClick={this.switchZh}>中文</a>	    
		
	    </div>
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

	this.state = {signedIn: -1}; // -1 undecided, 0 false, 1 true
    }


    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleLoginSuccess() {
	window.$("#apple-sign-in-button").hide();
	window.$("#apple-sign-out-button").show();
	this.setState({signedIn: 1});
    }

    render() {

	function gotoMap() {
	    window.location.href = '/';
	}

	return (
	    <div className="default">

	      <CKComponent onLoginSuccess={this.handleLoginSuccess} />
	      <SiteHeader selected='account' />

	      <div className="signinout">

		<img src='signin-icloud.png' />

		<div id='apple-sign-in-button'></div>
		<div id='apple-sign-out-button'></div>

		{ (this.state.signedIn === -1) &&
		    (<p>All your data is saved in Apple's iCloud. You are the only one who have access to your data. For more information, visit <a href='https://www.apple.com//icloud/'>iCloud intro page</a>.</p>)

		}
		{ (this.state.signedIn === 1) &&
		  (<p><button type="button" onClick={gotoMap} className="btn btn-light">Go to Map</button></p>)
		}

	    </div>


		<SiteFooter />
		</div>
	);
    }
}

export default Account;
