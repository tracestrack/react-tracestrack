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
          <a className="navbar-brand" href="/"><img id="logo" src="/logo.png" /></a>


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
                 (<a className="nav-link active" href="/account">Account</a>))
                  ||
                  (<a className="nav-link " href="/account">Account</a>)
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

export class SiteFooter extends React.Component {
  render() {
    return (

      <footer className="container">
        <hr className="featurette-divider" />

        <p>© 2015-2019 TracesTrack {packageJson["version"]} | <a href="/privacy">Privacy</a> · <a href="https://blog.traces.website/about/">About</a></p>
      </footer>

    );
  }
}

