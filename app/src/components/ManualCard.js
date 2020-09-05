import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Icon from "@material-ui/core/Icon";

//Custom component to display practical manual data
export default function ManualCard(props) {
  return (
    <Card
      style={{
        height: props.variant === "Introduction" ? "10rem" : "18rem",
        marginTop: props.variant === "Introduction" ? "0rem" : "2rem",
      }}
    >
      <Card.Header as="h5">
        <Row>
          <Col md={4}>{props.variant}</Col>
          <Col md={{ span: 1, offset: 7 }}>
            <Icon
              style={{
                fontSize: "1.5rem",
                color: "rgb(78, 45, 132)",
              }}
            >
              {props.variant === "Introduction"
                ? "emoji_objects"
                : "visibility"}
            </Icon>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body
        style={{
          overflowY: "scroll",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html:
              props.variant === "Introduction"
                ? props.experiment.information
                : props.experiment.method,
          }}
        />
      </Card.Body>
    </Card>
  );
}
