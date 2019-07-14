import React from 'react';
import CloudDatastore from '../../datastore/CloudDatastore.js';
import {SiteHeader, SiteFooter} from '../common/Page.js';
import SessionManager from '../common/SessionManager.js';
import './AccountPage.css';

class AccountPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = { username: "" };

    CloudDatastore.login();
    SessionManager.checkAuth().then((success) => {

      if (success) {
        this.setState({username: SessionManager.getUserName()});
      }
      else {
        alert("Please login.");
      }
    });
    
  }

  render() {

    return (
      <div className="default">

        <SiteHeader selected='account' />

        <main role="main" className="container">


          <div className="signinout">

            <img src='signin-icloud.png' alt='iCloud' />


            <div className="user_info">
              User name: {this.state.username}
            </div>


            <div id='apple-sign-in-button'></div>
            <div id='apple-sign-out-button'></div>

          </div>


          <p>All data is taken from and saved to iCloud. <br />
            Data is processed only in the app or in the browser. No intermediate servers have access to your data.
          </p>

        </main>

        <SiteFooter />
      </div>
    );
  }
}

export default AccountPage;
