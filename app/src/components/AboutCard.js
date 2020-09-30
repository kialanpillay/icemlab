import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Icon from "@material-ui/core/Icon";

//Custom component to display About text and graphics
export default class AboutCard extends Component {
  render() {
    return (
      <Card
        style={{
          height: "12rem",
          borderWidth: "0px",
        }}
        className="text-center"
      >
        <Card.Body>
          <Card.Title>
            <Badge
              pill
              style={{
                backgroundColor: "rgb(78, 45, 132)",
                color: "white",
                fontSize: "1.6rem",
              }}
            >
              {this.props.idx + 1}{" "}
              <Icon style={{ paddingTop: "0.1rem" }}>
                {this.props.idx !== 4 ? "arrow_right_alt" : "check_circle"}
              </Icon>
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
          <div>
            <h6>{this.props.text}</h6>
          </div>
        </Card.Body>
      </Card>
    );
  }
}
