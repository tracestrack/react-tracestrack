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

          <a onClick={this.props.onAddStar}>Add Star</a>
          <a onClick={this.props.onShowAttractions}>Show Nearby Attractions</a>
          <a onClick={this.props.onShowRestaurants}>Show Nearby Restaurants</a>
          <a onClick={this.props.onShowWikis}>Show Nearby Wikis</a>

        </DropdownContent>
      </Dropdown>

    );
  }
}


export default ContextMenu;
