import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

export default class Navigation extends Component {
  render() {
    return (
      <Navbar bg="light" variant="light">
        <Navbar.Brand href="/">
          <span>
            <h3>iCEMlab</h3>
          </span>
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/view">Upload</Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}
