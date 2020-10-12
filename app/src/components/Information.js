import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Icon from "@material-ui/core/Icon";

//Custom component to display apparatus or reagent data
export default class Information extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chemData: this.convertArrayToObject(
        "reagents",
        this.props.experiment.reagents
      ),
      wiki: this.convertArrayToObject(
        "apparatus",
        this.props.experiment.apparatus
      ),
    };
  }
  componentDidMount() {
    if (this.props.variant === "Reagents") {
      this.getPubChemData();
    } else {
      this.getWikipediaData();
    }
  }

  //Asynchronously retrieves data from the Wikipedia API
  getWikipediaData = async () => {
    this.props.apparatusData.forEach(async ({ wikiRef, name }) => {
      const base =
        "https://en.wikipedia.org/w/api.php?action=query&format=json";
      const proxy = "https://icemlab-cors-service.herokuapp.com/";
      try {
        const descResponse = await this.fetchJson(
          `${proxy}${base}&prop=description&titles=${wikiRef}`
        );
        let description = "";
        if ("description" in Object.values(descResponse.query.pages)[0]) {
          description = Object.values(descResponse.query.pages)[0].description;
        }
        this.setState((prev) => {
          let prevWiki = { ...prev.wiki };
          prevWiki[name] = {
            description: description,
          };
          return { ...prev, wiki: prevWiki };
        });
      } catch (error) {
        console.error("Could not get Wikipediadata", error);
      }
    });
  };

  //Asynchronously retrieves molecular compound data from the PubChem API
  getPubChemData = async () => {
    this.props.experiment.reagents.forEach(async (reagent) => {
      const formulaEndpoint = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${this.formatReagent(
        reagent
      )}/property/MolecularFormula/JSON`;
      const weightEndpoint = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${this.formatReagent(
        reagent
      )}/property/MolecularWeight/JSON`;

      try {
        const formulaResponse = await this.fetchJson(formulaEndpoint);
        let formula = "No Data";
        if ("PropertyTable" === Object.keys(formulaResponse)[0]) {
          formula =
            formulaResponse.PropertyTable.Properties[0].MolecularFormula;
        }

        const weightResponse = await this.fetchJson(weightEndpoint);
        let weight = "No Data";
        if ("PropertyTable" === Object.keys(weightResponse)[0]) {
          weight = `${weightResponse.PropertyTable.Properties[0].MolecularWeight} g/mol`;
        }
        this.setState((prev) => {
          let prevData = { ...prev.chemData };
          prevData[reagent] = {
            formula: formula,
            weight: weight,
          };
          return { ...prev, chemData: prevData };
        });
      } catch (error) {
        console.error("Could not get PubChem data", error);
      }
    });
  };

  //Asynchronous fetch API call
  fetchJson = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

  //Converts array items to object keys
  convertArrayToObject = (variant, array) => {
    const obj = {};
    if (variant === "apparatus") {
      return array.reduce((obj, item) => {
        return {
          ...obj,
          [item]: {},
        };
      }, obj);
    } else {
      return array.reduce((obj, item) => {
        return {
          ...obj,
          [item]: "",
        };
      }, obj);
    }
  };

  //Strips whitespaces and converts reagent string to lowercase
  formatReagent = (reagent) => {
    return reagent.replace(/\s+/g, "").toLowerCase();
  };

  render() {
    return (
      <Card
        style={{
          height: this.props.variant === "Reagents" ? "18rem" : "10rem",
          marginTop: this.props.variant === "Reagents" ? "2rem" : "0rem",
        }}
      >
        <Card.Header as="h5">
          <Row>
            <Col md={6}>{this.props.variant}</Col>
            <Col md={{ span: 1, offset: 4 }}>
              <Icon
                style={{
                  fontSize: "1.5rem",
                  color: "rgb(78, 45, 132)",
                }}
              >
                {this.props.variant === "Reagents" ? "science" : "biotech"}
              </Icon>
            </Col>
          </Row>
        </Card.Header>
        <ListGroup
          variant="flush"
          style={{
            overflowY: "scroll",
          }}
        >
          {this.props.variant === "Reagents"
            ? this.props.experiment.reagents.map((reagent, index) => {
                return (
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip>
                          <div style={{ textAlign: "left" }}>
                            Molecular Formula:
                            <br />
                            {this.state.chemData[reagent].formula || "Loading"}
                            <br />
                            Molecular Weight:
                            <br />
                            {this.state.chemData[reagent].weight || "Loading"}
                          </div>
                        </Tooltip>
                      }
                      key={index}
                    >
                      <ListGroup.Item key={index}>{reagent}</ListGroup.Item>
                    </OverlayTrigger>
                );
              })
            : this.props.experiment.apparatus.map((apparatus, index) => {
                return (
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip>
                        <div style={{ textAlign: "left" }}>
                          {this.state.wiki[apparatus].description|| "Loading"}
                        </div>
                      </Tooltip>
                    }
                    key={index}
                  >
                    <ListGroup.Item key={index}>{apparatus}</ListGroup.Item>
                  </OverlayTrigger>
                );
              })}
        </ListGroup>
      </Card>
    );
  }
}
