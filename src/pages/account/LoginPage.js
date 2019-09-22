import React from 'react';
import {HomepageHeader, SiteFooter} from '../common/Page.js';
import SessionManager from '../common/SessionManager.js';
import './AccountPage.css';

class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    SessionManager.checkAuth((user) => {
      window.location.href ="/map";
    }, () => {
      console.log("NOOO");
    });    
  }

  render() {

    return (
      <div className="default">

        <HomepageHeader />

        <main role="main" className="container">

          <div className="signinout">

            <img src='/signin-icloud.png' alt='iCloud' />

            <div id='apple-sign-in-button'></div>
            <div id='apple-sign-out-button'></div>

          </div>


          <p className="text-muted">Login with Apple ID to access iCloud database. <br />
            Data is processed at the client side. No intermediate servers have access to your data.
          </p>

        </main>

        <SiteFooter />
      </div>
    );
  }
}

export default LoginPage;
