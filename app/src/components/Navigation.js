import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

//Navigation component
export default class Navigation extends Component {
  render() {
    return (
      <Navbar bg="light" variant="light">
        <Navbar.Brand>
          <img alt="" src="logo.png" height="30" />
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/upload">Upload</Nav.Link>
        </Nav>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Brand href="http://www.chemistry.uct.ac.za/">
            <img alt="" src="transparent_straight_logo.gif" height="36" />{" "}
          </Navbar.Brand>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
