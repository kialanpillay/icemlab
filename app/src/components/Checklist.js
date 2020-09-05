import React, { Component } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

//Custom component for apparatus checklist
export default class Checklist extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    this.state = {
      checked: this.props.checked,
    };
    //Binding of method to the class instance
    this.handleToggle = this.handleToggle.bind(this);
  }
  //Setting the state of checked items to include the new checked items
  setChecked = (newChecked) => {
    this.setState({ checked: newChecked });
  };
  //Adding selected items to an array
  handleToggle = (value) => {
    const currentIndex = this.state.checked.indexOf(value);
    let newChecked = [...this.state.checked];

    if (currentIndex === -1) {
      newChecked.push(value); //adding checked items to newChecked
    } else {
      newChecked.splice(currentIndex, 1); //removing from checked
    }
    this.setChecked(newChecked);
    this.props.callback(newChecked);
  };

  render() {
    return (
      <List
        style={{
          width: this.props.variant === "experiment" ? "inherit" : "20rem",
          height: this.props.variant === "experiment" ? "34rem" : "20rem",
          overflowY: "scroll",
        }}
      >
        {this.props.data.map((value) => {
          const labelId = `checkbox-list-label-${value}`;

          return (
            <ListItem
              key={value}
              role={undefined}
              dense
              button
              onClick={() => this.handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={this.state.checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  labelstyle={{ color: "#4E2E84" }}
                  iconstyle={{ fill: "#4E2E84" }}
                  inputstyle={{ color: "#4E2E84" }}
                  style={{ color: "#4E2E84" }}
                />
              </ListItemIcon>
              {this.props.type === "experiment" ? (
                <p
                  id={labelId}
                  dangerouslySetInnerHTML={{
                    __html: `${value}`,
                  }}
                  style={{ fontSize: "0.8rem" }}
                />
              ) : (
                <ListItemText id={labelId} primary={` ${value}`} />
              )}
            </ListItem>
          );
        })}
      </List>
    );
  }
}
