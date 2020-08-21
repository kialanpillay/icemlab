import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Icon from "@material-ui/core/Icon";
import "bootstrap/dist/css/bootstrap.min.css";

export default class AboutCard extends Component {
  render() {
    return (
      <Card style={{ height: "12rem" }} className="text-center">
        <Card.Body>
          <Card.Title style={{ textAlign: "left" }}>
            <Badge
              pill
              style={{
                backgroundColor: "rgb(78, 45, 132)",
                color: "white",
              }}
            >
              {this.props.idx + 1}
            </Badge>
          </Card.Title>
          <Icon
            style={{
              fontSize: "64px",
              textAlign: "center",
            }}
          >
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
