import React from "react";
import Card from "react-bootstrap/Card";
import AddIcon from "@material-ui/icons/Add";

//Custom component used to navigate to uploading an experiment 
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
            fontSize: "15rem",
            color: "#4E2E84",
          }}
        />
      </div>
    </Card>
  );
}
