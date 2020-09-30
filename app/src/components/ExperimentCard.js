import React from "react";
import Badge from "react-bootstrap/Badge";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import "./ExperimentCard.css";

//Custom component to display experiments
export default function ExperimentCard(props) {
  const modified = props.experimentModified.substring(0, 10);

  return (
    <div
      className="custom-card"
      onClick={() => props.callbackTitle(props.experimentTitle)}
    >
      <div>
        <div
          className="courseBadge"
          style={{
            marginTop: "0.7rem",
            display: "flex",
          }}
        >
          <Badge
            style={{
              backgroundColor: props.experimentColor,
              color: "black",
              fontSize: "1rem",
              marginRight: "0.5rem",
            }}
          >
            {props.experimentCategory}
          </Badge>
        </div>
        <p
          style={{
            paddingTop: "0.5rem",
            paddingRight: "1rem",
            paddingLeft: "1rem",
            fontSize: "1.3rem",
            height: "5rem",
            textAlign: "left",
          }}
          dangerouslySetInnerHTML={{
            __html: props.experimentTitle,
          }}
        />

        <EditTwoToneIcon
          style={{
            fill: "#4E2E84",
            height: "70px",
            width: "50px",
            marginBottom: "0.5rem",
          }}
        />
        <p
          className="lastModified"
          style={{
            fontSize: "0.7rem",
            marginBottom: "0rem",
          }}
        >
          Last Modified: {modified}
        </p>
      </div>
    </div>
  );
}
