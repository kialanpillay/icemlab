import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Experiment from "./pages/Experiment";

export default function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/upload">
            <Upload />
          </Route>
          <Route exact path="/experiment">
            <Experiment />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}