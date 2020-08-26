import React from "react";
import Card from "react-bootstrap/Card";
import AddIcon from "@material-ui/icons/Add";

export default function UploadCard() {
  return (
    <Card
      style={{
        height: "15rem",
        marginTop: "2rem",
        cursor: "pointer",
      }}
      onClick={() => (window.location.href = "/upload")}
      className="text-center"
    >
      <div>
        <AddIcon
          style={{
            width: "20rem",
            height: "15rem",
            textAlign: "left",
            color: "#4E2E84",
          }}
        />
      </div>
    </Card>
  );
}
