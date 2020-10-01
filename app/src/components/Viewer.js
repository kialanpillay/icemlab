import React, { Component } from "react";

export default class Viewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: false,
    };
  }
  async componentDidMount() {
    const endpoint = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${this.props.compound}/property/MolecularFormula/JSON`;
    try {
      const response = await this.fetchJson(endpoint);
      if ("PropertyTable" === Object.keys(response)[0]) {
        this.setState({ valid: true });
      }
    } catch (error) {
      console.error("Could not get PubChem data", error);
    }
  }

  fetchJson = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

  render() {
    return (
      <div>
        <iframe
          title="pubchem-widget"
          className="pubchem-widget"
          src={`https://pubchem.ncbi.nlm.nih.gov/compound/${
            this.props.compound
          }#section=${this.props.section}&${
            this.props.section === "Physical-Description"
              ? "hide_title=false"
              : "hide_title=true"
          }&embed=true`}
          style={{ width: "24rem", height: "36rem", border: 0 }}
        ></iframe>
      </div>
    );
  }
}
