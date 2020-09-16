import React, { Component } from "react";
import "./Diagram.css";

import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ToggleButton from "@material-ui/lab/ToggleButton";

import { IconButton } from "@material-ui/core";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import PopoverStickOnHover from "./PopoverStickOnHover";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Tooltip from "react-bootstrap/Tooltip";

import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";

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
      wiki: {
        "Erlenmeyer Flask": {
          title: "Erlenmeyer Flask",
          description:
            "Flask which features a flat bottom, a conical body, and a cylindrical neck.",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/20150320-OSEC-LSC-0080_%2816299658674%29.jpg/58px-20150320-OSEC-LSC-0080_%2816299658674%29.jpg",
          source: "https://en.wikipedia.org/wiki/Erlenmeyer_flask",
        },
        Beaker: {
          title: "Beaker",
          description: "Cylindrical container with a flat bottom",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Beakers.jpg/100px-Beakers.jpg",
          source: "https://en.wikipedia.org/wiki/Beaker_(laboratory_equipment)",
        },
        "Ice Bath": {
          title: "Ice Bath",
          description:
            "Liquid mixture which is used to maintain low temperatures",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Aldolrxnpic.jpg/100px-Aldolrxnpic.jpg",
          source: "https://en.wikipedia.org/wiki/Cooling_bath",
        },
        "Hirsch Funnel": {
          title: "Hirsch Funnel",
          description: "Used to assist in collecting recrystallized compounds",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Embudo_B%C3%BCchner.jpeg/75px-Embudo_B%C3%BCchner.jpeg",
          source: "https://en.wikipedia.org/wiki/B%C3%BCchner_funnel",
        },
        "Büchner Funnel": {
          title: "Büchner Funnel",
          description: "Used to assist in collecting recrystallized compounds",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Embudo_B%C3%BCchner.jpeg/75px-Embudo_B%C3%BCchner.jpeg",
          source: "https://en.wikipedia.org/wiki/B%C3%BCchner_funnel",
        },
        "Glass Rod": {
          title: "Glass Rod",
          description: "Used to mix chemicals",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Stirring_rod.jpg/60px-Stirring_rod.jpg",
          wiki: "https://en.wikipedia.org/wiki/Glass_rod",
        },
        Hotplate: {
          title: "Hotplate",
          description: "Generally used to heat glassware or its contents",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Light_Label_Electric_tabletop_burner_KCK-L103.jpg/100px-Light_Label_Electric_tabletop_burner_KCK-L103.jpg",
          source: "https://en.wikipedia.org/wiki/Hot_plate",
        },
        "Reflux Condenser": {
          //used in more complex reactions that require the controlled mixing of multiple reagents
          title: "Reflux Condenser",
          description:
            "Used to condense vapors — that is, turn them into liquids — by cooling them down.",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Distillation_2-3.jpg/100px-Distillation_2-3.jpg",
          source: "https://en.wikipedia.org/wiki/Condenser_(laboratory)",
        },
        "Two-necked Flask": {
          title: "Two-necked Flask",
          description:
            "Used in more complex reactions that require the controlled mixing of multiple reagents",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Erlenmeyer_Flasks.jpg/100px-Erlenmeyer_Flasks.jpg",
          source: "https://en.wikipedia.org/wiki/Schlenk_flask",
        },
        Burner: {
          title: "Bunsen burner",
          description:
            "Produces a single open gas flame, and is used for heating, sterilization, and combustion",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bunsen_burner.jpg/58px-Bunsen_burner.jpg",
          source: "https://en.wikipedia.org/wiki/Bunsen_burner",
        },
      },
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

  componentDidMount() {
    this.loadGraph();
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
      const style =
        `${mxConstants.STYLE_SHAPE}=${mxConstants.SHAPE_IMAGE};` +
        `${mxConstants.STYLE_PERIMETER}=${mxPerimeter.RectanglePerimeter};` +
        `${mxConstants.STYLE_IMAGE}=${window.location.href}${src};` +
        `${mxConstants.STYLE_FONTCOLOR}:#FFFFFF`;

      let parent = graph.getDefaultParent();
      let cell = graph.insertVertex(parent, target, "", x, y, 100, 100, style);
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
      const wiki = this.state.wiki[name];

      if (!wiki) {
        return name;
      }

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
                    .filter((item) =>
                      item
                        .toLowerCase()
                        .includes(this.state.search.toLowerCase())
                    )
                    .map((item, index) => {
                      return (
                        <PopoverStickOnHover
                          component={<div>{popover(item)}</div>}
                          placement="right"
                          onMouseEnter={() => {}}
                          delay={200}
                        >
                          <img
                            alt={item}
                            className="item"
                            value={item}
                            src={`apparatus_svg/${item}.svg`}
                            key={index}
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
                    .filter((item) =>
                      item
                        .toLowerCase()
                        .includes(this.state.search.toLowerCase())
                    )
                    .map((item, index) => {
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
