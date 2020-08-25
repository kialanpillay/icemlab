import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Navigation from "../components/Navigation";
import Button from "react-bootstrap/Button";
import ExperimentCard from "../components/ExperimentCard";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";



//Experiment Dashboard Page Component 
export default class Dashboard extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders  
    this.state = {
      experiments: [],
    };
  

  }


  //GET request to retrieve an array of available experiments from the API server
  getExperiments = () => {
    const url = "https://icemlab.herokuapp.com/experiment";
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          experiments: [{title: "A"}, {title: "B"}],
          hidden: false,
        });
        
      })
      .catch((err) => {
        console.log(err);
      });
  console.log(this.state.experiments)
};


  render() {
    return (
      <div>
          <Navigation></Navigation>
        <Container style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          
         
            <Row>
              {this.state.experiments.map((item, index) => {
                return (
                  <Col
                    md={6}
            
                  >
                    <ExperimentCard
                      experimentTitle={item.title}
            
                    />
                  </Col>
                );
              })}
            </Row>
         
        </Container>
      
      </div>

    );
  }
}
