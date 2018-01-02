import React, { Component } from 'react';

class Account extends React.Component {
  render() {
    return (
      <button className="square" onClick={() => alert('click')}>
	    Account
      </button>
    );
  }
}


export default Account;
