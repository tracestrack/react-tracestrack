import React from 'react';
import {SiteHeader, SiteFooter} from '../common/Page.js';
import SessionManager from '../common/SessionManager.js';
import CloudDatastore from "../../datastore/CloudDatastore.js";
import {getValueFromCKKeyValues} from "../../datastore/Accessor.js";
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

    CloudDatastore.getKeyValues().then(
      result => {
        let re = result;
        this.setState({
          numStars: getValueFromCKKeyValues("numStars", re.records),
          numTraces: getValueFromCKKeyValues("numTraces", re.records)
        });
      }
    );
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
                Hello <b>{this.state.username}</b>,
                you have <b>{this.state.numTraces}</b> traces and <b>{this.state.numStars}</b> stars.
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
