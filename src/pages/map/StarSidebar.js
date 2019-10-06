import React, { Component } from "react";
import { Coord, MarkerType } from "../common/Models.js";
import { LiveMarkedArea } from "../../components/LiveMarkedArea.js";
import GreenStarImg from "../../resources/img/star_green.png";
import RedStarImg from "../../resources/img/star_red.png";
import "../../resources/Sidebar.css";
import { formatDate } from "../../utils/Formatter.js";
//import CloudDatastore from "../../datastore/Mock.js";
import CloudDatastore from "../../datastore/CloudDatastore.js";
import {getReverseGeocode} from '../../services/tomtom.js';
import {getGooglePlaceById} from '../../services/google.js';


class StarSidebar extends Component {

  constructor(props) {
    super(props);

    this.lastPoint = Coord(0, 0);
    this.lastType = -111;
    this.state = this.convertProps2State(props);
  }

  convertProps2State(props) {
    if (props.star != null) {
      var data;
      data = props.star;

      if (this.lastPoint.lat === data.coord.lat && this.lastPoint.lng === data.coord.lng && this.lastType === data.type) {
	return;
      }
      else {
	this.lastPoint = data.coord;
	this.lastType = data.type;
      }

      var ret = {
	title: "",
	note: "",
	type: data.type,
	url: "",
	coordinate: data.coord,
	editMode: false
      };

      let _this = this;
      switch (props.star.type) {
      case MarkerType.googlePlace:
        getGooglePlaceById(data.data, (result) => {
          _this.setState(_this.getStateByGooglePlace(result));
        });
	break;
      case MarkerType.new:
	ret.editMode = true;

	break;
      case MarkerType.searchHit:
	ret = Object.assign({}, ret, this.getStateByGooglePlace(data.data));

	break;
      default:
	this.loadStar(data);
	this.loadAddress(data.coord);
      }
      return ret;
    }
    return {};
  };


  enterEditMode = this.enterEditMode.bind(this);
  remove = this.remove.bind(this);
  cancel = this.cancel.bind(this);
  save = this.save.bind(this);

  loadStar = this.loadStar.bind(this);
  loadAddress = this.loadAddress.bind(this);

  titleChange = this.titleChange.bind(this);
  urlChange = this.urlChange.bind(this);
  noteChange = this.noteChange.bind(this);

  setGreenStar = this.setGreenStar.bind(this);
  setRedStar = this.setRedStar.bind(this);

  loadStar(star) {
    let _this = this;

    CloudDatastore.getRecord(star.recordName, (re) => {
	var state = {
	  title: re.fields.title.value ? re.fields.title.value : "non",
	  note: re.fields.note ? re.fields.note.value : "",
	  url: re.fields.url ? re.fields.url.value : "",
          countryCode: re.fields.countryCode ? re.fields.countryCode.value : "",
          countrySubdivision: re.fields.countrySubdivision ? re.fields.countrySubdivision.value : "",
	  creation: formatDate(new Date(re.created.timestamp))
	};
	_this.setState(state);
      }
    );
  }

  setGreenStar() {
    let _t = this;
    this.setState({type:MarkerType.green}, e => {
      _t.save();
    });
  }

  setRedStar() {
    let _t = this;
    this.setState({type:MarkerType.red}, e => {
      _t.save();
    });
  }

  loadAddress(latlng) {
    let _this = this;
    getReverseGeocode(latlng.lat, latlng.lng, (result) => {
      _this.setState({
	address: result.address
      });
    });
  }

  getStateByGooglePlace = this.getStateByGooglePlace.bind(this);
  getStateByGooglePlace(place) {
    let state = {
      title: place.name,
      address: place.address,
      countryCode: place.countryCode,
      countrySubdivision: place.countrySubdivision,
      url: place.url,
      note: place.note,
      creation: null
    };

    return state;
  }

  enterEditMode() {
    this.setState({ editMode: true });
  }

  cancel() {
    this.setState({ editMode: false });
  }

  remove() {
    var rn = this.props.star.recordName;
    let _this = this;

    CloudDatastore.removeRecord(rn).then(
      re => {
	_this.props.onStarRemoved(re);
      }
    );
  }

  save() {

    var star = {};
    let _this = this;

    this.setState({ isSaving: true });

    star.fields = {};

    star.recordName = this.props.star.recordName ? this.props.star.recordName : "";

    star.fields.location = { latitude: this.state.coordinate.lat, longitude: this.state.coordinate.lng };
    star.recordType = "Star";

    star.fields.title = this.newTitle ? this.newTitle : this.state.title;
    star.fields.note = this.newNote ? this.newNote : this.state.note;
    star.fields.type = this.state.type;
    star.fields.url = this.newURL ? this.newURL : this.state.url;
    star.fields.countryCode = this.state.countryCode;
    star.fields.countrySubdivision = this.state.countrySubdivision;

    console.log(star);

    CloudDatastore.saveRecord(star, re => {
	_this.setState({ isSaving: false });

	console.log("SAVE RE: ", re);
	_this.setState({
	  title: star.fields.title,
	  url: star.fields.url,
	  note: star.fields.note,
	  editMode: false
	});

	if (typeof _this.props.onStarRecordCreated === "function") {
	  _this.props.onStarRecordCreated(re);
	}
    });
  }

  componentWillReceiveProps(props) {
    this.ck = props.ck;
    this.setState(this.convertProps2State(props));
  }

  titleChange(e) {
    this.newTitle = e.target.value ? e.target.value : "Untitled";
  }
  urlChange(e) {
    this.newURL = e.target.value;
  }
  noteChange(e) {
    this.newNote = e.target.value;
  }

  render() {
    return (
      <div className="sidebar-right">

	{(this.state.editMode === false) &&
	 (
	   <div className="star-type">
	     <button disabled={this.state.type === 0} onClick={this.setRedStar} className={this.state.type === 0 ? "btn btn-light" : "btn"}>
               <img src={RedStarImg} className="starSet" alt="red star" />Want to visit
             </button>

	     <button disabled={this.state.type === 1}  onClick={this.setGreenStar} className={this.state.type === 1 ? "btn btn-light" : "btn"}>
               <img src={GreenStarImg} className="starSet" alt="green star" />Visited
             </button>
	   </div>)
	}

	<div className="controls">
	  {!this.state.editMode ?
	   (<button className="btn btn-sm btn-primary" onClick={this.enterEditMode}>Edit</button>) :
	   (
	     <div>
	       <button disabled={this.state.isSaving} className="btn btn-sm btn-danger" onClick={this.remove}>Delete</button>
	       <button disabled={this.state.isSaving} className="btn btn-sm btn-secondary" onClick={this.cancel}>Cancel</button>
	       <button disabled={this.state.isSaving} className="btn btn-sm btn-primary" onClick={this.save}>Save</button>
	     </div>
	   )
	  }
	</div>
	<h1 className="name">
	  {!this.state.editMode ?
	   this.state.title :
	   (<input type="text" placeholder="Name" defaultValue={this.state.title} onChange={this.titleChange} />)
	  }
	</h1>
	<div className="infoBox">

	  <div><span>Address</span>
	    {this.state.address}</div>

	  <div><span>Country</span>
            {this.state.countrySubdivision}, {this.state.countryCode}</div>

	  <div><span>Coordinate</span>
	    {this.state.coordinate.lat.toFixed(6)}, {this.state.coordinate.lng.toFixed(6)}</div>

	  {(this.state.creation !== null) && (
	    <div><span>Creation</span>
	      {this.state.creation}</div>)}


	  {
	    ((this.state.editMode === true) || ((this.state.editMode === false && this.state.url !== "") &&
						(
						  <div><span>URL</span>
						    {!this.state.editMode ? (<a target="_blank" rel="noopener noreferrer" href={this.state.url}>{this.state.url}</a>) : (<input type="text" placeholder="URL" defaultValue={this.state.url} onChange={this.urlChange} />)}</div>)))
	  }
	</div>

	<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note} value={this.state.note} onChange={this.noteChange} />

      </div>
    );
  }

}

export default StarSidebar;
