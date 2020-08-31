import React, { Component } from "react";
import Diagram from "../components/Diagram";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Navigation from "../components/Navigation";
import Information from "../components/Information";
import ManualCard from "../components/ManualCard";
import Checklist from "../components/Checklist";
import "bootstrap/dist/css/bootstrap.min.css";

export default class Experiment extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      experiment: [],
      hidden: true,
      checked: [],
    };
  }

  //Sets the state of the checked array to include items that have been selected.
  callback = (checked) => {
    this.setState({ checked: checked });
  };

  //Encode query parameters for a HTTP request
  encodeParameters = (params) => {
    let query = Object.keys(params)
      .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");
    return `?${query}`;
  };

  //GET request to retrieve a experiment data from the API server
  getExperiment = () => {
    const endpoint = "https://icemlab.herokuapp.com/experiment/";
    const query = {
      title: this.props.experiment,
    };
    const url = endpoint + this.encodeParameters(query);
    console.log(url);
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          experiment: response.experiment,
          hidden: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //Calls method once the component has rendered
  componentDidMount() {
    this.getExperiment();
  }

  render() {
    return (
      <div>
        <Navigation />
        <Tabs defaultActiveKey="practical-manual" style={{ marginTop: "1rem" }}>
          <Tab eventKey="practical-manual" title="Practical Manual">
            <Container style={{ marginTop: "2rem", marginBottom: "2rem" }}>
              {this.state.hidden ? (
                <Row className="justify-content-center">
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ marginTop: "2rem" }}
                  >
                    <span className="sr-only">Loading...</span>
                  </Spinner>{" "}
                </Row> //Spinner component displays while waiting for a server response
              ) : (
                <div>
                  <Row className="justify-content-center">
                    <Col md="auto">
                      <h1
                        dangerouslySetInnerHTML={{
                          __html: this.props.experiment,
                        }}
                      />
                    </Col>
                  </Row>
                  <Row style={{ marginTop: "2rem" }}>
                    <Col md={8}>
                      <ManualCard
                        experiment={this.state.experiment}
                        type={"Introduction"}
                      />
                      <ManualCard
                        experiment={this.state.experiment}
                        type={"Method"}
                      />
                    </Col>
                    <Col md={4}>
                      <Information
                        experiment={this.state.experiment}
                        type={"Reagents"}
                      />
                      <Information
                        experiment={this.state.experiment}
                        type={"Apparatus"}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Container>
          </Tab>
          <Tab eventKey="diagram" title="Virtual Experiment">
            <Row>
              <Col md={9}>
                <Diagram />
              </Col>
              <Col md={3}>
                <h5 style={{ marginTop: "2rem" }}>Experiment Steps</h5>
                <Checklist
                  data={
                    this.state.hidden
                      ? []
                      : this.state.experiment.method.split(".").slice(0, -1)
                  }
                  checked={this.state.checked}
                  callback={this.callback}
                  type="experiment"
                />
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </div>
    );
  }
}
