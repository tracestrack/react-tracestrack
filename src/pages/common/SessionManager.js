'strict';
import Datastore from '../../datastore/Datastore.js';

/**
   SessionManager takes care of logging into iCloud and maintains states.
*/

class SessionManager {

  static isLogin = false;
  static checkAuth(onAuthenticated, onUnAuthenticated) {
    let redirectToLoginPage = function() {
      document.write("Please login. Redirecting to login page in 3 seconds");
      setTimeout(function(){
        window.location.href = "/login";
      }, 3000);
    };

    if (SessionManager.isLogin === false) {
      Datastore.getInstance().login((user)=> {
        SessionManager.setUserName(user.nameComponents.givenName + " " + user.nameComponents.familyName);
        SessionManager.isLogin = true;
        if (onAuthenticated) onAuthenticated(user);
      }, (err)=> {
        if (onUnAuthenticated) onUnAuthenticated(err);
        else redirectToLoginPage();
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
