'strict';
import CloudDatastore from '../../datastore/CloudDatastore.js';

/**
   SessionManager takes care of logging into iCloud and maintains states.
*/

class SessionManager {

  static isLogin = false;
  static checkAuth(onAuthenticated, onUnAuthenticated) {
    if (SessionManager.isLogin === false) {

      CloudDatastore.login((user)=> {
        SessionManager.setUserName(user.nameComponents.givenName + " " + user.nameComponents.familyName);
        SessionManager.isLogin = true;
        if (onAuthenticated) onAuthenticated(user);
      }, (err)=> {
        if (onUnAuthenticated) onUnAuthenticated(err);
      });
    }
  }

  static setUserName(val) {
    sessionStorage.setItem('userName', val);
  }

  static getUserName() {
    return sessionStorage.getItem('userName');
  }

}

export default SessionManager;
