import React, { Component } from 'react';
import '../../resources/ContextMenu.css';
import Dropdown, { DropdownContent } from 'react-simple-dropdown';

class ContextMenu extends Component {

  constructor(props) {
    super(props);
    this.state = { active: false };
  }

  componentWillReceiveProps(props) {
    this.setState({
      active: props.active
    });
  }

  render() {

    return (
      <Dropdown active={this.state.active} style={{ left: this.props.position.left, top: this.props.position.top }}>

        <DropdownContent>

          <button onClick={this.props.onAddStar}>Add Star</button>
          <button onClick={this.props.onShowAttractions}>Show Nearby Attractions</button>
          <button onClick={this.props.onShowRestaurants}>Show Nearby Restaurants</button>
          <button onClick={this.props.onShowWikis}>Show Nearby Wikis</button>

        </DropdownContent>
      </Dropdown>

    );
  }
}


export default ContextMenu;
