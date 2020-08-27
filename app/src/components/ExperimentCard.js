import React from "react";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import "./ExperimentCard.css";

//Custom component to display expierments 
export default function ExperimentCard(props) {
  return (
    <div className="custom-card">
      <div>
        <p
          style={{
            padding: "1.5rem",
            fontSize: "1.5rem",
            height: "7rem",
            textAlign: "left",
          }}
          dangerouslySetInnerHTML={{
            __html: props.experimentTitle,
          }}
        />
        <EditTwoToneIcon
          style={{
            fill: "#4E2E84",
            height: "80px",
            width: "60px",
          }}
        />
      </div>
    </div>
  );
}
