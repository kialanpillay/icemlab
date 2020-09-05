import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Icon from "@material-ui/core/Icon";

//Custom component to display experiment apparatus or reagent information
export default class Information extends Component {
  render() {
    return (
      <Card
        style={{
          height: this.props.variant === "Reagents" ? "10rem" : "18rem",
          marginTop: this.props.variant === "Reagents" ? "0rem" : "2rem",
        }}
      >
        <Card.Header as="h5">
          <Row>
            <Col md={6}>{this.props.variant}</Col>
            <Col md={{ span: 1, offset: 4 }}>
              <Icon
                style={{
                  fontSize: "1.5rem",
                  color: "rgb(78, 45, 132)",
                }}
              >
                {this.props.variant === "Reagents" ? "science" : "biotech"}
              </Icon>
            </Col>
          </Row>
        </Card.Header>
        <ListGroup
          variant="flush"
          style={{
            overflowY: "scroll",
          }}
        >
          {this.props.variant === "Reagents"
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
