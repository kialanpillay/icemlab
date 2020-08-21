import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Icon from "@material-ui/core/Icon";
import "bootstrap/dist/css/bootstrap.min.css";

export default class AboutCard extends Component {
  render() {
    return (
      <Card style={{ height: "12rem" }}>
        <Card.Body>
          <Card.Title>
            <Badge pill variant="dark">
              {this.props.idx + 1}
            </Badge>
          </Card.Title>
          <Icon style={{ fontSize: "64px", textAlign: "center" }}>
            {this.props.icon}
          </Icon>
          <Card.Text>
            <h6>{this.props.text}</h6>
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}
