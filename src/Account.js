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

<nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <a className="navbar-brand" href="#">Traces</a>


      <div className="collapse navbar-collapse" id="navbarsExample04">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">

	    {   (this.state.selected=='map') && 
		    (<a className="nav-link active" href="/map">Map</a>)
			  ||
		    (<a className="nav-link" href="/map">Map</a>)
	    }
	    

          </li>
          <li className="nav-item">
	    {   (this.state.selected=='activities') && 
		    (<a className="nav-link active" href="/activities">Activities</a>)
			  ||
		    (<a className="nav-link " href="/activities">Activities</a>)
		  }

          </li>
          <li className="nav-item">
	    {
		(this.state.selected=='stars') && 
		  (<a className="nav-link active" href="/stars">Stars</a>)
		  ||
		  (<a className="nav-link " href="/stars">Stars</a>)
	  }

          </li>
          <li className="nav-item">

	    {
		(this.state.selected=='account') && 
		  (<a className="nav-link active" href="/account">Account</a>)
		  ||
		  (<a className="nav-link " href="/account">Account</a>)
	  }

          </li>	  
        </ul>

      </div>
    </nav>

		</header>
	);
    }
}

export class SiteFooter extends React.Component {
    render() {
	return (

<footer className="container">
  <hr className="featurette-divider" />

        <p>© 2015-2018 Traces · <a href="/privacy">Privacy</a> · <a href="/about">About</a></p>
      </footer>

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
