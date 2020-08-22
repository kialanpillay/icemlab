import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import "./Upload.css";
import Navigation from "../components/Navigation";
import Button from "react-bootstrap/Button";
import Checklist from "../components/Checklist";
import Card from "react-bootstrap/Card";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apparatus: [],
    };
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
  componentDidMount() {
    this.getApparatus();
  }

  render() {
    return (
      <div className="page">
        <Navigation></Navigation>
        <div className="container u-form">
          <Form>
            <div className="u-div">
              <div className="ulabel">Experiment Details</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="expiermentName">
                  <Form.Label>Experiment Name </Form.Label>
                  <Form.Control
                    placeholder="Enter Experiment Name"
                    required={true}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="preamble">
                  <Form.Label>Experiment Preamble </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    placeholder="Enter Experiment Preamble"
                    required={true}
                  />

                 
                </Form.Group>
                <Form.Group as={Col} controlId="apparatus" >
                  <Form.Label>Apparatus Checklist</Form.Label>
                  <Checklist
                    data={this.state.apparatus}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="reagents">
                  <Form.Label>Reagents</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="8"
                    placeholder="Enter Reagents, seperated by a comma e.g. Potassium, Sodium Chloride"
                    required={true}
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
                    placeholder="Additional Notes"
                    required={true}
                  />
                </Form.Group>
                <Button className="ubutton" variant="secondary" size="lg">
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
