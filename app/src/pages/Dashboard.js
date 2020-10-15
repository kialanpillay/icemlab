import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Navigation from "../components/Navigation";
import ExperimentCard from "../components/ExperimentCard";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import UploadCard from "../components/UploadCard";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Badge from "react-bootstrap/Badge";
import Upload from "./Upload";
import { ICEMLAB_SERVICE } from "../apiUrls";

//Experiment Dashboard Page Component
export default class Dashboard extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      experiments: [], //array to store experiments retrieved from the server
      search: "",
      loading: true,
      selection: "",
    };
    //Binding of methods to the class instance
    this.handleSearch = this.handleSearch.bind(this);
    this.callbackTitle = this.callbackTitle.bind(this);
  }
  //Sets search-string state using the value of a user event (key press)
  handleSearch = (event) => {
    this.setState({ search: event.target.value });
  };

  //Callback function to set selected experiment title
  callbackTitle = (title) => {
    this.setState({ selection: title });
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
          loading: false,
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

  render() {
    if (this.state.selection === "") {
      return (
        <div>
          <Navigation></Navigation>
          <Container>
            <Row
              style={{
                marginTop: "2rem",
                height: "3rem",
              }}
            >
              <Col md={3}>
                <a
                  href="https://stats.uptimerobot.com/jLLm4fjk6w"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge variant="secondary" style={{ fontSize: "1rem" }}>
                    iCEMlab Service Monitoring
                  </Badge>
                </a>
              </Col>
              <Col md={{ span: 4, offset: 5 }}>
                {/*Search bar*/}
                <InputGroup>
                  <FormControl
                    placeholder={
                      this.state.loading
                        ? "Loading"
                        : "Search for an experiment"
                    }
                    value={this.state.search}
                    onChange={this.handleSearch}
                  />
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                {/*Rendering the card which allows experiments to be uploaded when clicked on*/}
                <UploadCard />
              </Col>
              {this.state.experiments
                .filter((experiment) =>
                  experiment.title
                    .toLowerCase()
                    .includes(this.state.search.toLowerCase())
                )
                .map((experiment, index) => {
                  return (
                    <Col md={4} key={index}>
                      <ExperimentCard
                        experimentTitle={experiment.title}
                        experimentCategory={experiment.category}
                        experimentModified={experiment.modified}
                        experimentColor={this.getCategoryColor(
                          experiment.category
                        )}
                        callbackTitle={this.callbackTitle}
                      />
                    </Col>
                  );
                })}
            </Row>
          </Container>
        </div>
      );
    } else {
      //Render the Upload component once the user has made a selection
      return (
        <div>
          <Upload experimentTitle={this.state.selection} edit={true} />
        </div>
      );
    }
  }
}
