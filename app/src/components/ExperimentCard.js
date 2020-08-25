import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export default function ExperimentCard(props) {
  return (
    <div>
      <Card
        style={{ width: "20rem", height: "15rem", marginTop: "2rem" }}
        className="text-center"
      >
        <Card.Body>
          <p
            style={{
              fontSize: "1.5rem",
              height: "7rem",
              textAlign: "left",
            }}
            dangerouslySetInnerHTML={{
              __html: props.experimentTitle,
            }}
          />

          <Button
            style={{
              backgroundColor: "#4E2E84",
              marginTop: "0rem",
              alignItems: "center",
              borderWidth: "0px",
            }}
          >
            View
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
