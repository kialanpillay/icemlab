import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import "./Upload.css";
import Navigation from "../components/Navigation";

class Upload extends Component {
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
              </div>
            </div>
            <hr />
          </Form>
        </div>
      </div>
    );
  }
}
export default Upload;
