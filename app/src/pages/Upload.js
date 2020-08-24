import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import "./Upload.css";
import Navigation from "../components/Navigation";
import Button from "react-bootstrap/Button";
import Checklist from "../components/Checklist";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apparatus: [],
      name: "",
      preamble: "",
      checked: [],
      reagents: "",
      method: "",
      notes: "",
      reagentArr: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.callback = this.callback.bind(this);
  }

  getApparatus = () => {
    const apparatusEndpoint = "https://icemlab.herokuapp.com/apparatus";
    fetch(apparatusEndpoint, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          apparatus: response.apparatus,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  callback = (checked) => {
    this.setState({ checked: checked });
  };

  componentDidMount() {
    this.getApparatus();
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onUpload() {
    this.setState({ reagentArr: this.state.reagents.split(",") });
  }

  putPayload = () => {
    this.onUpload();

    const payload = {
      title: this.state.name,
      information: this.state.preamble,
      apparatus: this.state.checked,
      reagents: this.state.reagentArr,
      method: this.state.method,
      notes: this.state.notes,
    };
    const url = "https://icemlab.herokuapp.com/experiment";
    fetch(url, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())

      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <div className="page">
        <Navigation></Navigation>
        <div className="container u-form">
          <div className="pageHeading">Experiment Upload</div>
          <hr />
          <Form>
            <div className="u-div">
              <div className="ulabel">Experiment Details</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="expiermentName">
                  <Form.Label>Experiment Name </Form.Label>
                  <Form.Control
                    placeholder="Enter Experiment Name"
                    required={true}
                    name="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="preamble">
                  <Form.Label>Experiment Preamble </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    placeholder="Enter Experiment Preamble"
                    required={true}
                    name="preamble"
                    value={this.state.preamble}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="apparatus">
                  <Form.Label>Apparatus Checklist</Form.Label>
                  <Checklist
                    data={this.state.apparatus}
                    checked={this.state.checked}
                    callback={this.callback}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="reagents">
                  <Form.Label>Reagents</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="8"
                    placeholder="Enter Reagents, seperated by a comma e.g. Potassium, Sodium Chloride"
                    required={true}
                    name="reagents"
                    value={this.state.reagents}
                    onChange={this.handleChange}
                  />
                </Form.Group>
              </div>
            </div>
            <hr />
            <div className="u-div">
              <div className="ulabel">Experiment Method</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="expiermentMethod">
                  <Form.Label>Experiment Method </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="15"
                    placeholder="Enter Experiment Method"
                    required={true}
                    name="method"
                    value={this.state.method}
                    onChange={this.handleChange}
                  />
                </Form.Group>
              </div>
            </div>
            <hr />
            <div className="u-div">
              <div className="ulabel">Additonal Notes</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="additionalNotes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="6"
                    placeholder=""
                    name="notes"
                    value={this.state.notes}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Button
                  className="ubutton"
                  variant="secondary"
                  size="lg"
                  onClick={() => this.putPayload()}
                >
                  Upload
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
export default Upload;
