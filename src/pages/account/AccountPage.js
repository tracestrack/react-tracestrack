import React from 'react';
import {SiteHeader, SiteFooter} from '../common/Page.js';
import SessionManager from '../common/SessionManager.js';
import './AccountPage.css';

class AccountPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = { username: "" };

    SessionManager.checkAuth((user) => {
        this.setState({username: SessionManager.getUserName()});
    }, (e) => {
      window.location.href ="/";
    });
  }

  render() {

    return (
      <div className="default">

        <SiteHeader selected='account' />

        <main role="main" className="container">


          <div className="signinout">

            <img src='signin-icloud.png' alt='iCloud' />

            {this.state.username !== "" && (
              <div className="user_info">
                User name: {this.state.username}
              </div>)
            }


            <div id='apple-sign-in-button'></div>
            <div id='apple-sign-out-button'></div>

          </div>

        </main>

        <SiteFooter />
      </div>
    );
  }
}

export default AccountPage;
