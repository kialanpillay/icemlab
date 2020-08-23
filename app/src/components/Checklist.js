import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

export default function CheckboxList(props) {
  const [checked, setChecked] = React.useState([]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value); //adding checked items to newChecked

    } else {
      newChecked.splice(currentIndex, 1); //removing from checked
    }
    setChecked(newChecked);
    props.callback(newChecked);
  };

  return (
    <List style={{ width: "20rem" }}>
      {props.data.map((value) => {
        const labelId = `checkbox-list-label-${value}`;

        return (
          <ListItem
            key={value}
            role={undefined}
            dense
            button
            onClick={handleToggle(value)}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.indexOf(value) !== -1}
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
