import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

//Custom Input component for reagent data
export default class ReagentInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  //Updates component state with selected values
  handleChange = (event, values) => {
    this.setState(
      {
        selected: values,
      },
      () => {
        this.props.callback(this.state.selected);
      }
    );
  };

  render() {
    //Material UI Theme
    const theme = createMuiTheme({
      palette: {
        primary: { main: "#4E2E84" },
      },
    });

    return (
      <div className="inputBlock">
        <Autocomplete
          multiple
          id="tags-outlined"
          options={this.props.data}
          filterSelectedOptions
          value={this.state.selected}
          onChange={this.handleChange}
          renderInput={(params) => (
            <ThemeProvider theme={theme}>
              <TextField
                {...params}
                variant="outlined"
                placeholder="Enter Reagents"
                margin="normal"
                fullWidth
              />
            </ThemeProvider>
          )}
        />
      </div>
    );
  }
}
