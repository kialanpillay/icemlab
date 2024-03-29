import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";
import Icon from "@material-ui/core/Icon";
import Navigation from "../components/Navigation";
import AboutCard from "../components/AboutCard";
import Experiment from "./Experiment";
import { ICEMLAB_SERVICE } from "../apiUrls";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

//Array of data for the About functionality
const ABOUT = [
  {
    text: "Select Experiment",
    icon: "search",
  },
  {
    text: "View Details",
    icon: "visibility",
  },
  {
    text: "Drag and Drop Apparatus",
    icon: "touch_app",
  },
  {
    text: "Complete Checklist",
    icon: "done_all",
  },
  {
    text: "Export Diagram",
    icon: "save",
  },
];
//Home Page Component
export default class Home extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      experiments: [],
      search: "",
      selection: "",
      hidden: true,
    };
    //Binding of methods to the class instance
    this.handleSelection = this.handleSelection.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  //Returns a hex colour code for distinct categories
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

  //Sets search state variable using the value of a user event (key press)
  handleSearch = (event) => {
    this.setState({ search: event.target.value });
  };
  //Resets search state variable, which clears the input component
  handleClear = () => {
    this.setState({ search: "" });
  };
  //Sets the experiment selection state variable
  handleSelection = (selection) => {
    this.setState({ selection: selection });
  };
  //GET request to retrieve an array of available experiments from the API server
  getExperiments = () => {
    const url = `${ICEMLAB_SERVICE}/experiment/`;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          experiments: response.experiments,
          hidden: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //Calls method once the component has rendered
  componentDidMount() {
    this.getExperiments();
  }

  render() {
    if (this.state.selection === "") {
      return (
        <div className="App">
          <Navigation />
          <Container style={{ marginTop: "2rem" }}>
            <Row className="justify-content-center">
              <Col md="auto">
                <h1 style={{ fontSize: "4rem" }}>Virtual Chemistry Lab</h1>
              </Col>
              <Icon
                style={{
                  fontSize: "5rem",
                  color: "rgb(78, 45, 132)",
                }}
              >
                science
              </Icon>
            </Row>

            {!this.state.hidden ? (
              <div>
                <Row
                  style={{ marginTop: "0rem" }}
                  className="justify-content-center"
                >
                  <Col md="auto">
                    <h2>Select an Experiment to Get Started</h2>
                  </Col>
                </Row>
                <Row
                  style={{ marginTop: "1rem" }}
                  className="justify-content-center"
                >
                  <Col md={9}>
                    <InputGroup className="mb-3">
                      <FormControl
                        placeholder={`Search from over ${this.state.experiments.length} different experiments`}
                        value={this.state.search}
                        onChange={this.handleSearch}
                      />
                      <InputGroup.Append>
                        <Button
                          variant="outline-secondary"
                          onClick={() => this.handleClear()}
                        >
                          Clear
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Card
                      style={{
                        marginTop: "1rem",
                        height: "10rem",
                        overflowY: "scroll",
                      }}
                    >
                      <ListGroup variant="flush">
                        {this.state.experiments
                          .filter((experiment) =>
                            experiment.title
                              .toLowerCase()
                              .includes(this.state.search.toLowerCase())
                          )
                          .map((experiment, index) => {
                            return (
                              //Tooltip functionality to display experiment description on mouseover
                              <OverlayTrigger
                                placement="left"
                                overlay={
                                  <Tooltip>
                                    <div style={{ textAlign: "left" }}>
                                      Summary
                                      <div style={{ display: "flex" }}>
                                        {experiment.reagents.length}
                                        <Icon
                                          style={{
                                            color: "white",
                                          }}
                                        >
                                          science
                                        </Icon>
                                        {experiment.apparatus.length}
                                        <Icon
                                          style={{
                                            color: "white",
                                          }}
                                        >
                                          biotech
                                        </Icon>
                                        180
                                        <Icon
                                          style={{
                                            color: "white",
                                          }}
                                        >
                                          schedule
                                        </Icon>
                                      </div>
                                      <br />
                                      {experiment.information}
                                    </div>
                                  </Tooltip>
                                }
                                key={index}
                              >
                                <ListGroup.Item
                                  action
                                  onClick={() =>
                                    this.handleSelection(experiment.title)
                                  }
                                  key={index}
                                >
                                  <div style={{ display: "flex" }}>
                                    <Badge
                                      style={{
                                        backgroundColor: this.getCategoryColor(
                                          experiment.category
                                        ),
                                        color: "black",
                                        fontSize: "1rem",
                                        marginRight: "0.5rem",
                                      }}
                                    >
                                      {experiment.category}
                                    </Badge>
                                    {/*Inner HTML used to display subscripts*/}
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: experiment.title,
                                      }}
                                    />
                                  </div>
                                </ListGroup.Item>
                              </OverlayTrigger>
                            );
                          })}
                      </ListGroup>
                    </Card>
                  </Col>
                </Row>
                <Row
                  style={{ marginTop: "3rem" }}
                  className="justify-content-center"
                >
                  {ABOUT.map((item, idx) => {
                    return (
                      <Col md={2} key={idx}>
                        <AboutCard
                          idx={idx}
                          text={item.text}
                          icon={item.icon}
                        />
                      </Col>
                      //Each array item is mapped to a custom component, consisting of text and an icon
                    );
                  })}
                </Row>
              </div>
            ) : (
              <Row className="justify-content-center">
                <Spinner
                  animation="border"
                  role="status"
                  style={{ marginTop: "2rem" }}
                >
                  <span className="sr-only">Loading...</span>
                </Spinner>{" "}
              </Row> //Spinner component displays while waiting for a server response
            )}
          </Container>
        </div>
      );
    } else {
      //Render the Experiment component if user has made a selection
      return <Experiment experiment={this.state.selection} />;
    }
  }
}
