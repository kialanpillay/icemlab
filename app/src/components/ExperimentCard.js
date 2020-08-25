import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";



export default function ExperimentCard(props) {
  return (
    <div>
      <Card style={{ width: "20rem", height: "15rem", marginTop: "2rem", textAlign: "left"  }}>
       
        <Card.Body>
        <p style={{ fontFamily: "Helvetica Neue", fontSize: "1.2rem", height: "7rem" }}
          dangerouslySetInnerHTML={{
            __html: props.experimentTitle,
          }}
          />
        

          <Button 
            style={{
              backgroundColor: "#4E2E84",
              marginTop: "0rem",
              alignItems:"center"
              
            }}
        
          >View
          
          </Button>
     
        </Card.Body>
      </Card>
    </div>
  );
}
