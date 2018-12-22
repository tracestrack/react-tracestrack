import React from 'react';
import CKComponent from '../../datastore/Cloud.js';
import $ from 'jquery';
// eslint-disable-next-line
import sessionManager from '../common/SessionManager.js';
import {SiteHeader, SiteFooter} from '../common/Page.js';

class AccountPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = { signedIn: -1 }; // -1 undecided, 0 false, 1 true

  }

  handleLoginSuccess = this.handleLoginSuccess.bind(this);
  handleLoginSuccess() {
    $("#apple-sign-in-button").hide();
    $("#apple-sign-out-button").show();
    this.setState({ signedIn: 1 });
  }

  render() {

    return (
      <div className="default">

        <CKComponent onLoginSuccess={this.handleLoginSuccess} />
        <SiteHeader selected='account' />

        <main role="main" className="container">

          <div className="signinout">

            <img src='signin-icloud.png' alt='iCloud' />

            <div id='apple-sign-in-button'></div>
            <div id='apple-sign-out-button'></div>

            {(this.state.signedIn === -1) &&
             (<p>All your data is saved in Apple's iCloud. You are the only one who have access to your data. For more information, visit <a href='https://www.apple.com//icloud/'>iCloud intro page</a>.</p>)

            }

          </div>

          <p>All data is taken from and saved to iCloud. Data is processed either in the app or in the browser. No intermediate servers process your data.</p>

        </main>



        <SiteFooter />
      </div>
    );
  }
}

export default AccountPage;
