import React, { Component } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

export default class CheckList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: [],
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  setChecked = (newChecked) => {
    this.setState({ checked: newChecked });
  };

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
      <List style={{ width: "20rem" }}>
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
                  color="primary"
                  iconstyle={{ fill: "#4E2E84" }}
                  labelstyle={{ color: "#4E2E84" }}
                  inputstyle={{ color: "#4E2E84" }}
                  style={{ colour: "#4E2E84" }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={` ${value}`} />
            </ListItem>
          );
        })}
      </List>
    );
  }
}
