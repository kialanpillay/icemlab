import React, { Component } from "react";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Tooltip from "react-bootstrap/Tooltip";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ToggleButton from "@material-ui/lab/ToggleButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";
import PopoverStickOnHover from "./PopoverStickOnHover";
import "./Diagram.css";

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
  mxImage,
  mxKeyHandler,
} from "mxgraph-js";

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
      reagentWiki: this.convertArrayToObject(this.props.reagents),
      apparatusWiki: this.convertArrayToObject(this.props.apparatus),
      loaded: false,
      search: "",
      anchorEl: null,
      open: false,
    };
    this.sidebar = React.createRef();
    this.toolbar = React.createRef();
    this.graphContainer = React.createRef();
    this.loadGraph = this.loadGraph.bind(this);
    this.undoManager = null;
  }

  //Calls method once the component has rendered
  componentDidMount() {
    this.loadGraph();
    this.getWikipediaData("apparatus");
    this.getWikipediaData("reagents");
  }

  //Asynchronous method to retrieve data from the Wikipedia API
  getWikipediaData = async (variant) => {
    const data =
      variant === "apparatus" ? this.props.apparatus : this.props.reagents;
    data.forEach(async ({ wikiRef, name }) => {
      const base =
        "https://en.wikipedia.org/w/api.php?action=query&format=json";
      const proxy = "https://icemlab-cors-service.herokuapp.com/";
      try {
        const descResponse = await this.fetchJson(
          `${proxy}${base}&prop=description&titles=${wikiRef}`
        );
        let description = "";
        if ("description" in Object.values(descResponse.query.pages)[0]) {
          description = Object.values(descResponse.query.pages)[0].description;
        }

        const imgResponse = await this.fetchJson(
          `${proxy}${base}&prop=pageimages&titles=${wikiRef}&pithumbsize=100`
        );
        let image = "";
        if ("thumbnail" in Object.values(imgResponse.query.pages)[0]) {
          image = Object.values(imgResponse.query.pages)[0].thumbnail.source;
        }

        const srcResponse = await this.fetchJson(
          `${proxy}${base}&prop=info&inprop=url&titles=${wikiRef}`
        );
        const source = Object.values(srcResponse.query.pages)[0].fullurl;
        this.setState((prev) => {
          let prevWiki =
            variant === "apparatus"
              ? { ...prev.apparatusWiki }
              : { ...prev.reagentWiki };
          prevWiki[name] = {
            description: description,
            image: image,
            source: source,
          };
          if (variant === "apparatus") {
            return { ...prev, apparatusWiki: prevWiki };
          } else {
            return { ...prev, reagentWiki: prevWiki };
          }
        });
      } catch (error) {
        console.log(wikiRef);
        console.error("Could not get wikipedia data", error);
      }
    });
  };

  //Asynchronous fetch API call
  fetchJson = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

  //Converts array items to object keys
  convertArrayToObject = (array) => {
    const obj = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item["name"]]: {},
      };
    }, obj);
  };

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
    mxConstraintHandler.prototype.pointImage = new mxImage("point.gif", 5, 5);
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
    style[mxConstants.STYLE_STROKECOLOR] = "black";
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_FONTSIZE] = "14";
    style[mxConstants.VALID_COLOR] = "black";

    graph.getStylesheet().putDefaultEdgeStyle(style);

    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
      return node.createPopupMenu(graph, menu, cell, evt);
    };
  };

  //Functor used create a styled graph node
  funct = (graph, evt, target, x, y, value, src, type) => {
    if (src !== null) {
      const style =
        `${mxConstants.STYLE_SHAPE}=${mxConstants.SHAPE_IMAGE};` +
        `${mxConstants.STYLE_IMAGE}=${window.location.href}${src};`;

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(parent, target, "", x, y, 100, 100, style);
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    } else if (type === null) {
      const style =
        `${mxConstants.STYLE_SHAPE}=${mxConstants.SHAPE_RECTANGLE};` +
        `${mxConstants.STYLE_FILLCOLOR}=none;` +
        `${mxConstants.STYLE_STROKECOLOR}=none;` +
        `${mxConstants.STYLE_STROKEWIDTH}=0;` +
        `${mxConstants.STYLE_FONTSIZE}=14;` +
        `${mxConstants.STYLE_FONTCOLOR}=black`;

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(
        parent,
        target,
        value,
        x,
        y,
        `${value.length * 8}`,
        20,
        style
      );
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    } else if (type === "text") {
      const style =
        `${mxConstants.STYLE_SHAPE}=${mxConstants.SHAPE_RECTANGLE};` +
        `${mxConstants.STYLE_FILLCOLOR}=none;` +
        `${mxConstants.STYLE_STROKECOLOR}=none;` +
        `${mxConstants.STYLE_STROKEWIDTH}=0;` +
        `${mxConstants.STYLE_FONTSIZE}=14;` +
        `${mxConstants.STYLE_FONTCOLOR}=black`;

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(
        parent,
        target,
        value,
        x,
        y,
        100,
        40,
        style
      );
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    } else {
      const style =
        `${mxConstants.STYLE_SHAPE}=${mxConstants.SHAPE_ELLIPSE};` +
        `${mxConstants.STYLE_PERIMETER}=${mxPerimeter.EllipsePerimeter};` +
        `${mxConstants.STYLE_STROKECOLOR}=none;` +
        `${mxConstants.STYLE_STROKEWIDTH}=none;` +
        `${mxConstants.STYLE_FILLCOLOR}=${type}`;

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(parent, target, "", x, y, 30, 30, style);
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    }
    this.props.callback(Object.keys(this.state.graph.model.cells).length - 2);
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
    const popover = (name, variant) => {
      const wiki =
        variant === "apparatus"
          ? this.state.apparatusWiki[name]
          : this.state.reagentWiki[name];

      if (!wiki) {
        return name;
      }
      const { description, image, source } =
        variant === "apparatus"
          ? this.state.apparatusWiki[name]
          : this.state.reagentWiki[name];

      return (
        <div style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 5 }}>{name}</div>

          {image && (
            <div style={{ backgroundColor: "white", display: "inline-block" }}>
              <img src={image} alt={name} />
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

    const exportPNG = async () => {
      const { graph } = this.state;

      const encoder = new mxCodec();
      const result = encoder.encode(graph.getModel());
      const xml = mxUtils.getXml(result);

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

      const response = await fetch("https://icemlab-export.herokuapp.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          w,
          h,
          xml,
        }),
      });

      const imageBlob = await response.blob();
      const imageFilename = "Experiment.png";

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(imageBlob, imageFilename);
      } else {
        let element = window.document.createElement("a");
        element.href = window.URL.createObjectURL(imageBlob);
        element.download = imageFilename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    };

    //Exports the diagram to an XML representation
    const exportXML = async () => {
      const { graph } = this.state;

      // save/download XML
      const encoder = new mxCodec();
      const result = encoder.encode(graph.getModel());
      const xml = mxUtils.getXml(result);
      const xmlBlob = new Blob([xml], { type: "text/xml" });
      const xmlFilename = "Experiment.xml";

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(xmlBlob, xmlFilename);
      } else {
        let element = window.document.createElement("a");
        element.href = window.URL.createObjectURL(xmlBlob);
        element.download = xmlFilename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    };

    //Mutators

    const handleSearch = (event) => {
      this.setState({ search: event.target.value });
    };

    const handleClick = (event) => {
      this.setState({ anchorEl: event.currentTarget });
    };

    const handleClose = () => {
      this.setState({ anchorEl: null });
    };

    const showGeneratingPng = () => {
      this.setState({ open: true });
    };

    const closeGeneratingPng = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }

      this.setState({ open: false });
    };

    return (
      <div>
        <div className="sidebar" ref={this.sidebar}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder={"Search"}
              value={this.state.search}
              onChange={handleSearch}
            />
          </InputGroup>

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
                  {this.props.apparatus
                    .filter((apparatus) =>
                      apparatus.name
                        .toLowerCase()
                        .includes(this.state.search.toLowerCase())
                    )
                    .map((apparatus, index) => {
                      return (
                        <PopoverStickOnHover
                          component={
                            <div>{popover(apparatus.name, "apparatus")}</div>
                          }
                          placement="right"
                          onMouseEnter={() => {}}
                          delay={200}
                          key={index}
                        >
                          <img
                            alt={apparatus.name}
                            className="item"
                            value={apparatus.name}
                            src={`apparatus_svg/${apparatus.name}.svg`}
                          />
                        </PopoverStickOnHover>
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
                  {this.props.reagents
                    .filter((reagent) =>
                      reagent.name
                        .toLowerCase()
                        .includes(this.state.search.toLowerCase())
                    )
                    .map((reagent, index) => {
                      return (
                        <div key={index}>
                          <p className="item" value={reagent.name}>
                            {reagent.name}
                          </p>
                          <PopoverStickOnHover
                            component={
                              <div>{popover(reagent.name, "reagent")}</div>
                            }
                            placement="right"
                            onMouseEnter={() => {}}
                            delay={200}
                            key={index}
                          >
                            <div
                              className="item"
                              value=""
                              style={{
                                backgroundColor: reagent.color,
                                padding: "0.5rem",
                                margin: "-5px 0 10px 0",
                                textAlign: "center",
                                cursor: "pointer",
                                borderRadius: "100%",
                                width: "15px",
                              }}
                              type={reagent.color}
                            ></div>
                          </PopoverStickOnHover>
                        </div>
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
                    type="text"
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
          <OverlayTrigger placement="top" overlay={<Tooltip>Export</Tooltip>}>
            <ToggleButton
              value="color"
              aria-label="color"
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <SaveIcon />
              <ArrowDropDownIcon />
            </ToggleButton>
          </OverlayTrigger>
        </div>

        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              exportPNG();
              showGeneratingPng();
            }}
          >
            PNG
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              exportXML();
            }}
          >
            Draw.io
          </MenuItem>
        </Menu>

        <div className="containerWrapper">
          <div className="graphContainer" ref={this.graphContainer} />
        </div>

        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.open}
          autoHideDuration={6000}
          onClose={closeGeneratingPng}
          message="Generating image..."
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={closeGeneratingPng}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}
