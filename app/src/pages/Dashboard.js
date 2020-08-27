import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Navigation from "../components/Navigation";
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
      experiments: [], //array to store experiments retrieved from the server
      search: "",
    };
    //Binding of methods to the class instance
    this.handleSearch = this.handleSearch.bind(this);
   
  }
  //Sets search-string state using the value of a user event (key press)
  handleSearch = (event) => {
    this.setState({ search: event.target.value });
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
  //Calls method once the component has rendered
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
              {/*Search bar*/}
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
              {/*Rendering the card which allows experiments to be uploaded when clicked on*/}
              <UploadCard /> 
            </Col>
            {this.state.experiments.map((item, index) => {
              //Each experiment in the array is mapped to a card. If experiments have been filtered, only the relevant ones will be displayed.

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
