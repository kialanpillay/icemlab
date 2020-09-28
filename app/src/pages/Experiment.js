import React, { Component } from "react";
import Diagram from "../components/Diagram";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Navigation from "../components/Navigation";
import Information from "../components/Information";
import ManualCard from "../components/ManualCard";
import Checklist from "../components/Checklist";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactPlayer from "react-player";
import Alert from "react-bootstrap/Alert";
import { ICEMLAB_SERVICE } from "../apiUrls";

export default class Experiment extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      experiment: {},
      hidden: true,
      checked: [],
      checklistComplete: false,
      videoVisible: false,
      diagramComplete: false,
      reagents: [],
    };
  }

  //Sets the state of the checked array to include items that have been selected.
  callback = (checked) => {
    this.setState({ checked: checked });
    const checklistItems = this.state.experiment.method.split(".").slice(0, -1);
    if (checked.length === checklistItems.length) {
      this.setState({ checklistComplete: true, videoVisible: true });
    }
  };

  alertOnClose = () => {
    this.setState({ checklistComplete: false });
  };

  //Callback function to compare the number of diagram notes to experiment items
  callbackDiagram = (nodes) => {
    const numItems =
      this.state.experiment.apparatus.length +
      this.state.experiment.reagents.length;
    if (nodes >= numItems) {
      this.setState({ diagramComplete: true });
    }
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
    const endpoint = `${ICEMLAB_SERVICE}/experiment/`;
    const query = {
      title: this.props.experiment,
    };
    const url = endpoint + this.encodeParameters(query);
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

  //GET request to retrieve a reagent meta-deta from the API server
  getReagents = () => {
    const endpoint = `${ICEMLAB_SERVICE}/reagent/`;
    fetch(endpoint, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          reagents: response.reagents,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getCategoryColor = (category) => {
    let color;
    if (category === "CEM1000W") {
      color = "#FFE0B2";
    }
    if (category === "CEM2005W") {
      color = "#BBDEFB";
    }
    if (category === "CEM3000W") {
      color = "#D1C4E9";
    }
    return color;
  };

  //Calls method once the component has rendered
  componentDidMount() {
    this.getExperiment();
    this.getReagents();
  }

  render() {
    return (
      <div style={{ overflowX: "none" }}>
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
                      <h2
                        dangerouslySetInnerHTML={{
                          __html: this.props.experiment,
                        }}
                      />
                    </Col>
                  </Row>
                  <Row className="justify-content-center">
                    <Col md="auto">
                      <Badge
                        style={{
                          backgroundColor:
                            this.props.experiment === {}
                              ? "silver"
                              : this.getCategoryColor(
                                  this.state.experiment.category
                                ),
                          color: "black",
                          fontSize: "1.2rem",
                        }}
                      >
                        {this.props.experiment === {}
                          ? "CEM1XXXW"
                          : this.state.experiment.category}
                      </Badge>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: "2rem" }}>
                    <Col md={8}>
                      <ManualCard
                        experiment={this.state.experiment}
                        variant="Introduction"
                      />
                      <ManualCard
                        experiment={this.state.experiment}
                        variant="Method"
                      />
                    </Col>
                    <Col md={4}>
                      <Information
                        experiment={this.state.experiment}
                        variant="Reagents"
                      />
                      <Information
                        experiment={this.state.experiment}
                        variant="Apparatus"
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Container>
          </Tab>
          <Tab eventKey="diagram" title="Virtual Experiment">
            <Row style={{ margin: "0  0 0 -15px" }}>
              <Col md={9}>
                {this.state.hidden ||
                this.state.reagents.length === 0 ? null : (
                  <Diagram
                    apparatus={this.state.experiment.apparatus}
                    reagents={this.state.experiment.reagents.map((reagent) => ({
                      name: reagent,
                      color:
                        this.state.reagents.find(
                          (reagentData) => reagentData.name === reagent
                        )?.color || "rgb(100,100,100)",
                    }))}
                    callback={this.callbackDiagram}
                  />
                )}
              </Col>
              <Col md={3}>
                <Card style={{ marginTop: "1rem", height: "38rem" }}>
                  <Card.Header as="h5">Experiment Steps</Card.Header>
                  <Checklist
                    data={
                      this.state.hidden
                        ? []
                        : this.state.experiment.method.split(".").slice(0, -1)
                    }
                    checked={this.state.checked}
                    callback={this.callback}
                    variant="experiment"
                  />
                  <Alert //Indicating the successful experiment completion to the user
                    show={this.state.checklistComplete}
                    variant={this.state.diagramComplete ? "success" : "warning"}
                    dismissible
                    onClose={() => this.alertOnClose()}
                    style={{
                      display: "flex",
                      marginLeft: "0.5rem",
                      marginRight: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {this.state.diagramComplete
                      ? "Experiment complete! You may now view the demonstration."
                      : "Hold up! Check that you have added all required apparautus and reagents to your diagram."}
                  </Alert>
                </Card>
              </Col>
            </Row>
          </Tab>
          {this.state.hidden || this.state.experiment.url === "" ? null : (
            <Tab
              eventKey="video"
              title="Video Demonstration"
              disabled={!this.state.videoVisible}
            >
              <Container style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <Row className="justify-content-center">
                  <Col md="auto">
                    <h2
                      dangerouslySetInnerHTML={{
                        __html: this.props.experiment,
                      }}
                    />
                  </Col>
                </Row>
                <Row className="justify-content-center">
                  <Col md="auto">
                    <Badge
                      style={{
                        backgroundColor:
                          this.props.experiment === {}
                            ? "silver"
                            : this.getCategoryColor(
                                this.state.experiment.category
                              ),
                        color: "black",
                        fontSize: "1.2rem",
                      }}
                    >
                      {this.props.experiment === {}
                        ? "CEM1XXXW"
                        : this.state.experiment.category}
                    </Badge>
                  </Col>
                </Row>
                <Row
                  className="justify-content-center"
                  style={{ marginTop: "2rem" }}
                >
                  <ReactPlayer url={this.state.experiment.url} controls />
                </Row>
              </Container>
            </Tab>
          )}
        </Tabs>
      </div>
    );
  }
}
