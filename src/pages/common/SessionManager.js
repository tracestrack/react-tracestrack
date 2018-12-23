'strict';

class SessionManager {

  static setUserName(val) {
    sessionStorage.setItem('userName', val);

  }

  static getUserName() {
    return sessionStorage.getItem('userName');
  }

}

export default SessionManager;
