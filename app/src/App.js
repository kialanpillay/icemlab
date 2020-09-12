import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";

//Functional component that contains the React Router for declarative routing
export default function App() {
  return (
    <div>
      <Router data-testid="router">
        <Switch data-testid="switch">
          <Route exact path="/" data-testid="route">
            <Home />
          </Route>
          <Route exact path="/dashboard" data-testid="route">
            <Dashboard />
          </Route>
          <Route exact path="/upload" data-testid="route">
            <Upload edit={false} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
