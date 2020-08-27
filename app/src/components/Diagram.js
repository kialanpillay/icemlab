import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./Diagram.css";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

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
      json: "",
      dragElt: null,
      createVisible: false,
      currentNode: null,
      wiki: {
        flask: {
          title: "Flask",
        },
        microscope: {
          title: "Microscope",
        },
      },
    };
    this.loadGraph = this.loadGraph.bind(this);
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
        wikiRef: "Round-bottom_flask",
        title: "Round bottom flask",
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
  };

  //Generates a preview of an edited node
  getEditPreview = () => {
    var dragElt = document.createElement("div");
    dragElt.style.border = "dashed black 1px";
    dragElt.style.width = "120px";
    dragElt.style.height = "40px";
    return dragElt;
  };

  //Creates a draggable element from sidebar items (apparatus)
  createDragElement = () => {
    const { graph } = this.state;
    const tasksDrag = ReactDOM.findDOMNode(
      this.refs.mxSidebar
    ).querySelectorAll(".item");
    Array.prototype.slice.call(tasksDrag).forEach((ele) => {
      const src = ele.getAttribute("src");
      const value = ele.getAttribute("data-value");
      let ds = mxUtils.makeDraggable(
        ele,
        this.graphF,
        (graph, evt, target, x, y) =>
          this.funct(graph, evt, target, x, y, value, src),
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
        menu.addItem("Delete Connection", null, function () {
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
    const that = this;
    graph.gridSize = 30;
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.setConnectable(true);
    graph.setCellsEditable(true);
    graph.setEnabled(true);
    graph.centerZoom = true;
    graph.autoSizeCellsOnAdd = true;

    //Constructs rubberband object for element selection
    new mxRubberband(graph);
    graph.getTooltipForCell = function (cell) {
      return cell.getAttribute("data-value");
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
    style[mxConstants.STYLE_STROKECOLOR] = "#f90";
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_FONTSIZE] = "10";
    style[mxConstants.VALID_COLOR] = "#27bf81";

    graph.getStylesheet().putDefaultEdgeStyle(style);
    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
      return that.createPopupMenu(graph, menu, cell, evt);
    };
  };

  //Functor used create a styled graph node
  funct = (graph, evt, target, x, y, value, src) => {
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
  };

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
      graph.connectionHandler.isConnectableCell = function (cell) {
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

    graph.connectionHandler.createEdgeState = function (me) {
      let edge = graph.createEdge(
        null,
        null,
        "Edge",
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

  //Instantiates a toolbar with utility functions
  initToolbar = () => {
    const that = this;
    const { graph } = this.state;
    let toolbar = ReactDOM.findDOMNode(this.refs.toolbar);
    toolbar.appendChild(
      mxUtils.button("Zoom(+)", function (evt) {
        graph.zoomIn();
      })
    );
    toolbar.appendChild(
      mxUtils.button("Zoom(-)", function (evt) {
        graph.zoomOut();
      })
    );
    toolbar.appendChild(
      mxUtils.button("Restore", function (evt) {
        graph.zoomActual();
        const zoom = { zoomFactor: 1.2 };
        that.setState({
          graph: { ...graph, ...zoom },
        });
      })
    );
    let undoManager = new mxUndoManager();
    let listener = function (sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);

    toolbar.appendChild(
      mxUtils.button("Undo", function () {
        undoManager.undo();
      })
    );

    toolbar.appendChild(
      mxUtils.button("Redo", function () {
        undoManager.redo();
      })
    );

    toolbar.appendChild(mxUtils.button("Export", function () {}));
  };

  //Loads graph with initial node and layout
  loadGraph() {
    let container = ReactDOM.findDOMNode(this.refs.divGraph);
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    } else {
      //Constructs mxGraph object
      let graph = new mxGraph(container);
      this.setState(
        {
          graph: graph,
          dragElt: this.getEditPreview(),
        },
        () => {
          const layout = new mxCompactTreeLayout(graph, false);
          this.setState({ layout });
          this.setLayoutSetting(layout);
          this.loadGlobalSetting();
          this.setGraphSetting();
          this.initToolbar();
          this.settingConnection();
          this.createDragElement();
          let parent = graph.getDefaultParent();

          graph.getModel().beginUpdate();
          try {
            graph.insertVertex(parent, null, null, 300, 420, 600, 40, "table");
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
        <Popover id="popover-basic">
          <Popover.Title as="h3">{title}</Popover.Title>
          <Popover.Content>
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
          </Popover.Content>
        </Popover>
      );
    };

    return (
      <div>
        <div>
          <ul className="sidebar" ref="mxSidebar">
            <li>
              <h5>Apparatus</h5>
            </li>
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 1500 }}
              overlay={popover("flask")}
            >
              <img
                alt="Flask"
                className="item"
                data-value="Flask"
                src="science-24px.svg"
              />
            </OverlayTrigger>
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 1500 }}
              overlay={popover("microscope")}
            >
              <img
                alt="Microscope"
                className="item"
                data-value="Microscope"
                src="biotech-24px.svg"
              />
            </OverlayTrigger>
          </ul>
        </div>
        <div className="toolbar" ref="toolbar" />
        <div className="container-wrapper">
          <div className="graphContainer" ref="divGraph" />
        </div>
      </div>
    );
  }
}
