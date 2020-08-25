import React, { Component } from "react";
import Diagram from "../components/Diagram";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navigation from "../components/Navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default class Experiment extends Component {
  render() {
    return (
      <div>
        <Navigation />
        <Container style={{ marginTop: "2rem" }}>
          <Row className="justify-content-center">
            <Col md="auto">
              <h1
                dangerouslySetInnerHTML={{
                  __html: this.props.experiment,
                }}
              />
            </Col>
          </Row>
        </Container>
        <Diagram />
      </div>
    );
  }
}
