import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Navigation from "../components/Navigation";
import Button from "react-bootstrap/Button";
import ExperimentCard from "../components/ExperimentCard";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import UploadCard from "../components/UploadCard";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

//Experiment Dashboard Page Component
export default class Dashboard extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      experiments: [],
      search: "",
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }
  handleSearch = (event) => {
    this.setState({ search: event.target.value });
  };
  //Resets state, which clears the input component
  handleClear = () => {
    this.setState({ search: "" });
  };

  //GET request to retrieve an array of available experiments from the API server
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
      <div>
        <Navigation></Navigation>
        <Container>
          <Row
            style={{
              marginTop: "2rem",
            }}
          >
            <Col md={{ span: 4, offset: 8 }}>
              <InputGroup>
                <FormControl
                  placeholder={`Search for an experiment`}
                  value={this.state.search}
                  onChange={this.handleSearch}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <UploadCard />
            </Col>
            {this.state.experiments.map((item, index) => {
              return item.title
                .toLowerCase()
                .includes(this.state.search.toLowerCase()) ? (
                <Col md={4}>
                  <ExperimentCard experimentTitle={item.title} />
                </Col>
              ) : null;
            })}
          </Row>
        </Container>
      </div>
    );
  }
}
