import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";


export default function ExperimentCard(props) {
  return (
    <div>
      <Card style={{ width: "20rem", height: "15rem", marginTop: "2rem", textAlign: "left" }}>
       
        <Card.Body>
          <p style={{ fontFamily: "Helvetica Neue", fontSize: "0.8rem", height: "7rem"}}>
            {props.experimentTitle}
          </p>

          <Button
            style={{
              backgroundColor: "#4E2E84",
              marginTop: "0rem",
            }}
        
          >View
          
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
