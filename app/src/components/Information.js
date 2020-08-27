import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Icon from "@material-ui/core/Icon";

export default class Information extends Component {
  render() {
    return (
      <Card
        style={{
          height: this.props.type === "Reagents" ? "10rem" : "18rem",
          marginTop: this.props.type === "Reagents" ? "0rem" : "2rem",
          overflowY: "scroll",
        }}
      >
        <Card.Header as="h5">
          <Row>
            <Col md={6}>{this.props.type}</Col>
            <Col md={{ span: 1, offset: 4 }}>
              <Icon
                style={{
                  fontSize: "1.5rem",
                  color: "rgb(78, 45, 132)",
                }}
              >
                {this.props.type === "Reagents" ? "science" : "biotech"}
              </Icon>
            </Col>
          </Row>
        </Card.Header>
        <ListGroup variant="flush">
          {this.props.type === "Reagents"
            ? this.props.experiment.reagents.map((item, index) => {
                return <ListGroup.Item key={index}>{item}</ListGroup.Item>;
              })
            : this.props.experiment.apparatus.map((item, index) => {
                return <ListGroup.Item key={index}>{item}</ListGroup.Item>;
              })}
        </ListGroup>
      </Card>
    );
  }
}
