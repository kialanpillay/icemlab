import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export default class ReagentInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    };
    this.handleChange = this.handleChange.bind(this);
  }

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
    return (
      <div className="inputBlock" style={{ width: 500 }}>
        <Autocomplete
          multiple
          id="tags-outlined"
          options={this.props.data}
          getOptionLabel={(option) => option.title}
          filterSelectedOptions
          value={this.state.selected}
          onChange={this.handleChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Enter Reagents"
              margin="normal"
              fullWidth
            />
          )}
        />
      </div>
    );
  }
}
