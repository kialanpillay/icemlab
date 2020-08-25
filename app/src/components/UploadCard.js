import React from "react";
import Card from "react-bootstrap/Card";
import AddIcon from "@material-ui/icons/Add";

export default function UploadCard() {
  return (
    <Card
      style={{
        width: "20rem",
        height: "15rem",
        marginTop: "2rem",
        textAlign: "left",
        cursor:"pointer"
      }}
      onClick={() => (window.location.href = "/upload")}
    >
      <AddIcon
        style={{
          width: "20rem",
          height: "15rem",
          textAlign: "left",
          color: "#4E2E84",
        }}
      />
    </Card>
  );
}
