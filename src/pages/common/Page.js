import React from 'react';
import packageJson from '../../package.alias.json';

export class SiteHeader extends React.Component {

  constructor(props) {
    super(props);

    console.log(props);
    this.state = { selected: props.selected };
  }

  render() {
    return (


      <header className="masthead">

        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <a className="navbar-brand" href="/"><img alt="logo" id="logo" src="/images/logo.png" /></a>

          <div className="collapse navbar-collapse" id="navbarsExample04">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">

                {((this.state.selected === 'map') &&
                  (<a className="nav-link active" href="/map">Map</a>))
                 ||
                 (<a className="nav-link" href="/map">Map</a>)
                }
              </li>

              <li className="nav-item">
                {((this.state.selected === 'traces') &&
                  (<a className="nav-link active" href="/traces">Traces</a>))
                 ||
                 (<a className="nav-link " href="/traces">Traces</a>)
                }

              </li>
              <li className="nav-item">
                {
                  ((this.state.selected === 'stars') &&
                   (<a className="nav-link active" href="/stars">Stars</a>))
                    ||
                    (<a className="nav-link " href="/stars">Stars</a>)
                }

              </li>

            </ul>

            <div className="my-2 my-lg-0 navBarRight">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  {
                    ((this.state.selected === 'account') &&
                     (<a className="nav-link active" href="/">Account</a>))
                      ||
                      (<a className="nav-link " href="/">Account</a>)
                  }
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export class HomepageHeader extends React.Component {
  render() {
    return (
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample08" aria-controls="navbarsExample08" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-md-center" id="navbarsExample08">
            <ul className="navbar-nav">
              <li className="nav-item">
                <img width="160" alt="logo" id="logo" src="/images/logo.png" />
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
      <footer className="pt-4 my-md-5 pt-md-5 border-top">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md">
              <small className="d-block mb-3 text-muted">© Tracestrack 2015-2020</small>
              <img className="mb-2 rounded" src="/images/logo-sm.png" alt="" width="24" height="24" /><small className="mb-3 text-muted"> Build: {packageJson["version"]}</small>
              </div>
              <div className="col-6 col-md">
                <h5>Features</h5>
                <ul className="list-unstyled text-small">
                  <li><a className="text-muted" href="/placeholder">iOS App</a></li>
                  <li><a className="text-muted" href="/placeholder">Web</a></li>
                </ul>
              </div>
              <div className="col-6 col-md">
                <h5>Resources</h5>
                <ul className="list-unstyled text-small">
                  <li><a className="text-muted" href="https://medium.com/tracestrack">Blog</a></li>
                  <li><a className="text-muted" href="https://medium.com/tracestrack">Support</a></li>
                </ul>
              </div>
              <div className="col-6 col-md">
                <h5>About</h5>
                <ul className="list-unstyled text-small">
                  <li><a className="text-muted" href="/privacy">Privacy</a></li>
                  <li><a className="text-muted" href="/terms">Terms</a></li>
                </ul>
              </div>
            </div>
        </div>
      </footer>
    );
  }
}
