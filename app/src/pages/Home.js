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
import Navigation from "../components/Navigation";
import AboutCard from "../components/AboutCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const about = [
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

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      experiments: [],
      search: "",
      selection: "",
      hidden: true,
    };
    this.handleSelection = this.handleSelection.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  handleSearch = (event) => {
    this.setState({ search: event.target.value });
  };

  handleClear = () => {
    this.setState({ search: "" });
  };

  handleSelection = (selection) => {
    this.setState({ selection: selection });
  };

  getExperiments = () => {
    const url = "https://icemlab.herokuapp.com/experiment";
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

  componentDidMount() {
    this.getExperiments();
  }

  render() {
    return (
      <div
        className="App"
        style={{
          backgroundImage: "url('bg.png')",
          backgroundSize: "62rem auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right top",
        }}
      >
        <Navigation />
        <Container style={{ marginTop: "2rem" }}>
          <Row>
            <Col md={8}>
              <h1 style={{ fontSize: "4rem" }}>Virtual Chemistry Lab</h1>
            </Col>
            <Col md={4}>
              <h1
                style={{
                  fontSize: "2.5rem",
                  color: "white",
                  textAlign: "right",
                }}
              >
                UCT Department of Chemistry
              </h1>
            </Col>
          </Row>

          {!this.state.hidden ? (
            <div>
              <Row style={{ marginTop: "0rem" }}>
                <Col md={6}>
                  <h2>Select an Experiment to Get Started</h2>
                </Col>
              </Row>
              <Row style={{ marginTop: "1rem" }}>
                <Col md={6}>
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
                      {this.state.experiments.map((item, index) => {
                        return item.title
                          .toLowerCase()
                          .includes(this.state.search) ? (
                          <OverlayTrigger
                            placement="right"
                            overlay={<Tooltip>{item.information}</Tooltip>}
                          >
                            <ListGroup.Item
                              action
                              onClick={() => this.handleSelection(item.title)}
                              key={index}
                            >
                              {item.title.length < 60 ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: item.title,
                                  }}
                                />
                              ) : item.title.includes("sub") ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: `${item.title.substring(0, 80)}...`,
                                  }}
                                />
                              ) : (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: `${item.title.substring(0, 60)}...`,
                                  }}
                                />
                              )}
                            </ListGroup.Item>
                          </OverlayTrigger>
                        ) : null;
                      })}
                    </ListGroup>
                  </Card>
                </Col>
              </Row>
              <Row style={{ marginTop: "3rem" }}>
                {about.map((item, idx) => {
                  return (
                    <Col md={2}>
                      <AboutCard idx={idx} text={item.text} icon={item.icon} />
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <Spinner
              animation="border"
              role="status"
              style={{ marginTop: "2rem" }}
            >
              <span className="sr-only">Loading...</span>
            </Spinner>
          )}
        </Container>

       
      </div>
    );
  }
}
