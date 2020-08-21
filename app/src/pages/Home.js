import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Navigation from "../components/Navigation";
import AboutCard from "../components/AboutCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const about = [
  {
    text: "Select an Experiment",
    icon: "search",
  },
  {
    text: "View Details",
    icon: "visibility",
  },
  {
    text: "Drag and Drop Objects",
    icon: "touch_app",
  },
  {
    text: "Complete Checklist",
    icon: "done_all",
  },
  {
    text: "Export your Diagram",
    icon: "save",
  },
];

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      experiments: [],
      selection: "",
      hidden: true,
    };
    this.getSelection = this.getSelection.bind(this);
  }

  getSelection = (selection) => {
    this.setState({ selection: selection });
    console.log(selection);
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
      <div className="App" style={{ backgroundImage: "url('bg.png')" }}>
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
                Department of Chemistry
              </h1>
            </Col>
          </Row>

          {!this.state.hidden ? (
            <div>
              <Row style={{ marginTop: "2rem" }}>
                <Col md={6}>
                  <p style={{ fontSize: "2rem" }}>
                    Select an Experiment to Get Started.
                  </p>
                </Col>
              </Row>
              <Row style={{ marginTop: "0rem" }}>
                <Col md={6}>
                  <ListGroup>
                    {this.state.experiments.map((item, index) => {
                      return (
                        <ListGroup.Item
                          action
                          onClick={() => this.getSelection(item.title)}
                          key={index}
                        >
                          {item.title}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Col>
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
          <Row style={{ marginTop: "3rem" }}>
            {about.map((item, idx) => {
              return (
                <Col md={2}>
                  <AboutCard idx={idx} text={item.text} icon={item.icon} />
                </Col>
              );
            })}
          </Row>
        </Container>

        <Router>
          <Switch>
            <Route exact path="/experiment"></Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
