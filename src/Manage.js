import React, { Component } from 'react';

class Manage extends React.Component {
  render() {
    return (
      <button className="square" onClick={() => alert('click')}>
	    Manage
      </button>
    );
  }
}


export default Manage;
