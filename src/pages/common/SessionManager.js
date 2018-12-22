class SessionManager {

  sessionStorage = Window.sessionManager;
  
  setUserName(val) {
    sessionStorage.setItem('userName', val);

  }

  getUserName() {
    return sessionStorage.getItem('userName');
  }

}

// eslint-disable-next-line
let sessionManager; export default sessionManager = new SessionManager();
