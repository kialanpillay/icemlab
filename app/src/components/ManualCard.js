import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Icon from "@material-ui/core/Icon";

export default function ManualCard(props) {
  return (
    <Card
      style={{
        height: props.type === "Introduction" ? "10rem" : "18rem",
        marginTop: props.type === "Introduction" ? "0rem" : "2rem",
        overflowY: "scroll",
      }}
    >
      <Card.Header as="h5">
        <Row>
          <Col md={4}>{props.type}</Col>
          <Col md={{ span: 1, offset: 7 }}>
            <Icon
              style={{
                fontSize: "1.5rem",
                color: "rgb(78, 45, 132)",
              }}
            >
              {props.type === "Introduction"
                ? "emoji_objects"
                : "visibility"}
            </Icon>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div
          dangerouslySetInnerHTML={{
            __html:
              props.type === "Introduction"
                ? props.experiment.information
                : props.experiment.method,
          }}
        />
      </Card.Body>
    </Card>
  );
}
