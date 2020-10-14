import React from "react";

//Custom widget functional component for PubChem data
export default function Viewer(props) {
  return (
    <div>
      <iframe
        title="pubchem-widget"
        className="pubchem-widget"
        src={`https://pubchem.ncbi.nlm.nih.gov/compound/${
          props.compound
        }#section=${props.section}&${
          props.section === "Physical-Description"
            ? "hide_title=false"
            : "hide_title=true"
        }&embed=true`}
        style={{ width: "24rem", height: "36rem", border: 0 }}
      ></iframe>
    </div>
  );
}
