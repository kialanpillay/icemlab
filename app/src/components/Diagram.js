import React, { Component } from "react";
import "./Diagram.css";

import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Tooltip from "react-bootstrap/Tooltip";

import PopoverStickOnHover from "./PopoverStickOnHover";

import {
  mxGraph,
  mxConstants,
  mxEdgeStyle,
  mxGraphHandler,
  mxGuide,
  mxEdgeHandler,
  mxRubberband,
  mxDragSource,
  mxClient,
  mxConnectionHandler,
  mxUtils,
  mxEvent,
  mxConstraintHandler,
  mxUndoManager,
  mxConnectionConstraint,
  mxCellState,
  mxPoint,
  mxPerimeter,
  mxCompactTreeLayout,
  mxCodec,
  mxXmlCanvas2D,
  mxImageExport,
  mxXmlRequest,
  mxImage,
  mxKeyHandler,
} from "mxgraph-js";
import { IconButton } from "@material-ui/core";

//Diagramming Tool Component
export default class Diagram extends Component {
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      graph: {},
      layout: {},
      createVisible: false,
      currentNode: null,
      wiki: {
        flask: {
          title: "Erlenmeyer Flask",
        },
        microscope: {
          title: "Microscope",
        },
      },
      loaded: false,
    };
    this.sidebar = React.createRef();
    this.toolbar = React.createRef();
    this.graphContainer = React.createRef();
    this.loadGraph = this.loadGraph.bind(this);
    this.undoManager = null;
  }

  componentDidMount() {
    this.loadGraph();

    //Logic to retrieve apparatus images and descriptions from Wikipedia service

    const fetchJson = async (url) => {
      const response = await fetch(url);
      return await response.json();
    };

    const APPARATUS = [
      {
        name: "flask",
        wikiRef: "Erlenmeyer_flask",
        title: "Erlenmeyer Flask",
      },
      { name: "microscope", wikiRef: "Microscope", title: "Microscope" },
    ];

    APPARATUS.forEach(async ({ name, wikiRef, title }) => {
      const base =
        "https://wikipedia-cors.herokuapp.com/w/api.php?action=query&format=json";

      try {
        const descResponse = await fetchJson(
          `${base}&prop=description&titles=${wikiRef}`
        );
        const description = Object.values(descResponse.query.pages)[0]
          .description;

        const imgResponse = await fetchJson(
          `${base}&prop=pageimages&titles=${wikiRef}&pithumbsize=100`
        );
        const image = Object.values(imgResponse.query.pages)[0].thumbnail
          .source;

        const srcResponse = await fetchJson(
          `${base}&prop=info&inprop=url&titles=${wikiRef}`
        );
        const source = Object.values(srcResponse.query.pages)[0].fullurl;

        this.setState((prev) => {
          let prevWiki = { ...prev.wiki };
          prevWiki[name] = {
            title,
            description,
            image,
            source,
          };
          return { ...prev, wiki: prevWiki };
        });
      } catch (error) {
        console.error("Could not get wikipedia data", error);
      }
    });
  }
  //Functor to return current graph
  graphF = (evt) => {
    const { graph } = this.state;
    let x = mxEvent.getClientX(evt);
    let y = mxEvent.getClientY(evt);
    let elt = document.elementFromPoint(x, y);
    if (mxUtils.isAncestorNode(graph.container, elt)) {
      return graph;
    }
    return null;
  };

  //Sets global graph configuration
  loadGlobalSetting = () => {
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxEvent.isAltDown(evt);
    };
    mxEdgeHandler.prototype.snapToTerminals = true;
    mxConstraintHandler.prototype.pointImage = new mxImage(
      "https://uploads.codesandbox.io/uploads/user/4bf4b6b3-3aa9-4999-8b70-bbc1b287a968/-q_3-point.gif",
      5,
      5
    );
  };

  //Creates a draggable element from sidebar items (apparatus)
  createDragElement = () => {
    const { graph } = this.state;
    const items = this.sidebar.current.querySelectorAll(".item");
    Array.prototype.slice.call(items).forEach((ele) => {
      const src = ele.getAttribute("src");
      const value = ele.getAttribute("value");
      const type = ele.getAttribute("type");
      let ds = mxUtils.makeDraggable(
        ele,
        this.graphF,
        (graph, evt, target, x, y) =>
          this.funct(graph, evt, target, x, y, value, src, type),
        this.dragElt,
        null,
        null,
        graph.autoscroll,
        true
      );
      ds.isGuidesEnabled = function () {
        return graph.graphHandler.guidesEnabled;
      };
      ds.createDragElement = mxDragSource.prototype.createDragElement;
    });
  };
  //Changes the currently selected graph node
  selectionChanged = (graph, value) => {
    this.setState({
      createVisible: true,
      currentNode: graph.getSelectionCell(),
    });
  };

  //Creates node context menu
  createPopupMenu = (graph, menu, cell, evt) => {
    if (cell) {
      if (cell.edge === true) {
        menu.addItem("Delete Arrow", null, function () {
          graph.removeCells([cell]);
          mxEvent.consume(evt);
        });
      } else {
        menu.addItem("Delete", null, function () {
          graph.removeCells([cell]);
          mxEvent.consume(evt);
        });
      }
    }
  };

  //Sets graph configuration options
  setGraphSetting = () => {
    const { graph } = this.state;
    const node = this;
    graph.gridSize = 30;
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.setConnectable(true);
    graph.setCellsEditable(true);
    graph.setEnabled(true);
    graph.centerZoom = true;

    const keyHandler = new mxKeyHandler(graph);
    keyHandler.bindKey(46, function (evt) {
      if (graph.isEnabled()) {
        const currentNode = graph.getSelectionCell();
        if (currentNode.edge === true) {
          graph.removeCells([currentNode]);
        }
      }
    });
    //Constructs rubberband object for element selection
    new mxRubberband(graph);
    graph.getTooltipForCell = function (cell) {
      return this.convertValueToString(cell);
    };

    //Initialising style objects
    let style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_FILLCOLOR] = "sandybrown";
    style[mxConstants.STYLE_STROKECOLOR] = "black";
    style[mxConstants.STYLE_STROKEWIDTH] = 3;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_ARCSIZE] = 10;
    graph.getStylesheet().putCellStyle("table", style);

    style = {};
    style[mxConstants.STYLE_STROKECOLOR] = "black";
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_FONTSIZE] = "14";
    style[mxConstants.VALID_COLOR] = "black";

    graph.getStylesheet().putDefaultEdgeStyle(style);

    style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_FILLCOLOR] = "none";
    style[mxConstants.STYLE_STROKECOLOR] = "none";
    style[mxConstants.STYLE_STROKEWIDTH] = 0;
    style[mxConstants.STYLE_FONTSIZE] = "14";
    style[mxConstants.STYLE_FONTCOLOR] = "black";
    graph.getStylesheet().putCellStyle("reagent", style);

    style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_FILLCOLOR] = "none";
    style[mxConstants.STYLE_STROKECOLOR] = "black";
    style[mxConstants.STYLE_STROKEWIDTH] = 1;
    style[mxConstants.STYLE_FONTSIZE] = "14";
    style[mxConstants.STYLE_FONTCOLOR] = "black";
    graph.getStylesheet().putCellStyle("text", style);

    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
      return node.createPopupMenu(graph, menu, cell, evt);
    };
  };

  //Functor used create a styled graph node
  funct = (graph, evt, target, x, y, value, src, type) => {
    if (src !== null) {
      let style = {};
      style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
      style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
      style[mxConstants.STYLE_IMAGE] = src;
      style[mxConstants.STYLE_FONTCOLOR] = "#FFFFFF";
      graph.getStylesheet().putCellStyle(`item${src}`, style);

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(
        parent,
        target,
        "",
        x,
        y,
        100,
        100,
        `item${src}`
      );
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    } else if (type === null) {
      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(
        parent,
        target,
        value,
        x,
        y,
        `${value.length * 8}`,
        20,
        "reagent"
      );
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    } else {
      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(
        parent,
        target,
        value,
        x,
        y,
        100,
        40,
        "text"
      );
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    }
  };

  componentDidUpdate() {
    if (this.props.apparatus.length !== 0 && !this.state.loaded) {
      this.createDragElement();
      this.setState({ loaded: true });
    }
  }

  //Sets graph layout properties
  setLayoutSetting = (layout) => {
    layout.parallelEdgeSpacing = 10;
    layout.useBoundingBox = false;
    layout.edgeRouting = false;
    layout.levelDistance = 60;
    layout.nodeDistance = 16;
    layout.parallelEdgeSpacing = 10;
    layout.isVertexMovable = function (cell) {
      return true;
    };
  };

  //Handles and updates graph node connections
  settingConnection = () => {
    const { graph } = this.state;
    mxConstraintHandler.prototype.intersects = function (
      icon,
      point,
      source,
      existingEdge
    ) {
      return !source || existingEdge || mxUtils.intersects(icon.bounds, point);
    };

    let mxConnectionHandlerUpdateEdgeState =
      mxConnectionHandler.prototype.updateEdgeState;
    mxConnectionHandler.prototype.updateEdgeState = function (pt, constraint) {
      if (pt != null && this.previous != null) {
        let constraints = this.graph.getAllConnectionConstraints(this.previous);
        let nearestConstraint = null;
        let dist = null;

        for (var i = 0; i < constraints.length; i++) {
          var cp = this.graph.getConnectionPoint(this.previous, constraints[i]);

          if (cp != null) {
            var tmp =
              (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

            if (dist == null || tmp < dist) {
              nearestConstraint = constraints[i];
              dist = tmp;
            }
          }
        }

        if (nearestConstraint != null) {
          this.sourceConstraint = nearestConstraint;
        }
      }

      mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
    };

    if (graph.connectionHandler.connectImage == null) {
      graph.connectionHandler.isConnectableCell = function () {
        return false;
      };
      mxEdgeHandler.prototype.isConnectableCell = function (cell) {
        return graph.connectionHandler.isConnectableCell(cell);
      };
    }

    graph.getAllConnectionConstraints = function (terminal) {
      if (terminal != null && this.model.isVertex(terminal.cell)) {
        return [
          new mxConnectionConstraint(new mxPoint(0.5, 0), true),
          new mxConnectionConstraint(new mxPoint(0, 0.5), true),
          new mxConnectionConstraint(new mxPoint(1, 0.5), true),
          new mxConnectionConstraint(new mxPoint(0.5, 1), true),
        ];
      }
      return null;
    };

    graph.connectionHandler.createEdgeState = function () {
      let edge = graph.createEdge(
        null,
        null,
        null,
        null,
        null,
        "edgeStyle=orthogonalEdgeStyle"
      );

      return new mxCellState(
        this.graph.view,
        edge,
        this.graph.getCellStyle(edge)
      );
    };
  };

  //Instantiates undo manager  with utility functions
  initUndo = () => {
    const { graph } = this.state;

    let undoManager = new mxUndoManager();
    let listener = function (sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);

    this.undoManager = undoManager;
  };

  //Loads graph with initial node and layout
  loadGraph() {
    let container = this.graphContainer.current;
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    } else {
      //Constructs mxGraph object
      let graph = new mxGraph(container);
      this.setState(
        {
          graph: graph,
        },
        () => {
          const layout = new mxCompactTreeLayout(graph, false);
          this.setState({ layout });
          this.setLayoutSetting(layout);
          this.loadGlobalSetting();
          this.setGraphSetting();
          this.initUndo();
          this.settingConnection();
          this.createDragElement();

          graph.getModel().beginUpdate();
          try {
            //graph.insertVertex(parent, null, null, 180, 440, 480, 40, "table");
          } finally {
            graph.getModel().endUpdate();
          }
        }
      );
      mxEvent.disableContextMenu(container);
    }
  }

  render() {
    const popover = (name) => {
      const { title, description, image, source } = this.state.wiki[name];

      return (
        <div style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 5 }}>{title}</div>

          {image && (
            <div>
              <img src={image} alt={title} />
            </div>
          )}
          <div style={{ marginTop: 5 }}>{description || "Loading"}</div>
          {source && (
            <a href={source} target="_blank" rel="noopener noreferrer">
              More
            </a>
          )}
        </div>
      );
    };

    const exportDiagram = () => {
      const { graph } = this.state;

      // save/download XML
      const encoder = new mxCodec();
      const result = encoder.encode(graph.getModel());
      const xml = mxUtils.getXml(result);
      const blob = new Blob([xml], { type: "text/xml" });
      const filename = "experiment.xml";

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        const element = window.document.createElement("a");
        element.href = window.URL.createObjectURL(blob);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      // export PNG
      var xmlDoc = mxUtils.createXmlDocument();
      var root = xmlDoc.createElement("output");
      xmlDoc.appendChild(root);

      var xmlCanvas = new mxXmlCanvas2D(root);
      var imgExport = new mxImageExport();
      imgExport.drawState(
        graph.getView().getState(graph.model.root),
        xmlCanvas
      );

      var bounds = graph.getGraphBounds();
      var w = Math.ceil(bounds.x + bounds.width);
      var h = Math.ceil(bounds.y + bounds.height);

      var xmlText = mxUtils.getXml(root);
      new mxXmlRequest(
        "https://icemlab-export.herokuapp.com/",
        "format=png&w=" +
          w +
          "&h=" +
          h +
          "&bg=#F9F7ED&xml=" +
          encodeURIComponent(xmlText)
      ).simulate(document, "_blank");
    };

    return (
      <div>
        <div className="sidebar" ref={this.sidebar}>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  as="h5"
                  eventKey="0"
                  style={{ cursor: "pointer" }}
                >
                  Apparatus
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <PopoverStickOnHover
                    component={<div>{popover("flask")}</div>}
                    placement="right"
                    onMouseEnter={() => {}}
                    delay={200}
                  >
                    <img
                      alt="Flask"
                      className="item"
                      value="Flask"
                      src="science-24px.svg"
                    />
                  </PopoverStickOnHover>

                  {this.props.apparatus.map((item, index) => {
                    return (
                      <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip>{item}</Tooltip>}
                        key={index}
                      >
                        <img
                          alt={item}
                          className="item"
                          value={item}
                          src={`apparatus_svg/${item}.svg`}
                          key={index}
                        />
                      </OverlayTrigger>
                    );
                  })}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  as="h5"
                  eventKey="1"
                  style={{ cursor: "pointer" }}
                >
                  Reagents
                </Accordion.Toggle>
              </Card.Header>

              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  {this.props.reagents.map((item, index) => {
                    return (
                      <p className="item" value={item} key={index}>
                        {item}
                      </p>
                    );
                  })}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  as="h5"
                  eventKey="2"
                  style={{ cursor: "pointer" }}
                >
                  General
                </Accordion.Toggle>
              </Card.Header>

              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  <div
                    className="item"
                    value="Text"
                    type="General"
                    style={{
                      border: "1px solid black",
                      padding: "0.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      width: "100px",
                    }}
                  >
                    Text
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>

        <div className="toolbar">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Zoom In</Tooltip>}
          >
            <IconButton onClick={() => this.state.graph.zoomIn()}>
              <ZoomInIcon />
            </IconButton>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Zoom out</Tooltip>}
          >
            <IconButton onClick={() => this.state.graph.zoomOut()}>
              <ZoomOutIcon />
            </IconButton>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Restore</Tooltip>}
          >
            <IconButton onClick={() => this.state.graph.zoomActual()}>
              <ZoomOutMapIcon />
            </IconButton>
          </OverlayTrigger>
          <OverlayTrigger placement="bottom" overlay={<Tooltip>Undo</Tooltip>}>
            <IconButton onClick={() => this.undoManager.undo()}>
              <UndoIcon />
            </IconButton>
          </OverlayTrigger>
          <OverlayTrigger placement="bottom" overlay={<Tooltip>Redo</Tooltip>}>
            <IconButton onClick={() => this.undoManager.redo()}>
              <RedoIcon />
            </IconButton>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Export to PNG</Tooltip>}
          >
            <IconButton onClick={() => exportDiagram()}>
              <SaveIcon />
            </IconButton>
          </OverlayTrigger>
        </div>

        <div className="containerWrapper">
          <div className="graphContainer" ref={this.graphContainer} />
        </div>
      </div>
    );
  }
}
