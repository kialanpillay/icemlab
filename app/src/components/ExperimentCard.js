import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import { colors } from "@material-ui/core";

export default function ExperimentCard(props) {
  return (
    <div>
      <Card
        style={{ width: "20rem", height: "15rem", marginTop: "2rem", hover:"#4E2E84" }}
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
          <EditTwoToneIcon  style={{
              
              marginRight:"5px",
         
              fill:"#4E2E84",
              height:"80px",
              width:"60px"
            
             
            }}/>

          
        </Card.Body>
      </Card>
    </div>
  );
}
