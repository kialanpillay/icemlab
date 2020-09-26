import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Navigation from "../components/Navigation";
import ReagentInput from "../components/ReagentInput";
import Checklist from "../components/Checklist";
import Alert from "react-bootstrap/Alert";
import CheckIcon from "@material-ui/icons/Check";
import ReactQuill from "react-quill";
import "./Upload.css";
import "react-quill/dist/quill.snow.css";
import main from "../assets/main.png";

const EDITOR_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    ["link", "formula"],
    ["clean"],
  ],
};
const IMAGE_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    ["image", "formula"],
    ["clean"],
  ],
};

//Upload  Page Component
class Upload extends Component {
  //Constructor
  constructor(props) {
    super(props);
    //Initialising class state data
    //State is used instead of class member variables to avoid manually managing component renders
    this.state = {
      title: "",
      preamble: "",
      checkedApparatus: [],
      selectedReagents: [],
      method: "",
      notes: "",
      courseCode: "CEM1000W",
      videoLink: "",
      upload: false,
      hidden: true,
      apparatusData: [], //array to store apparatus retrieved from the server
      reagentsData: [],
      image: "",
    };
    //Binding of methods to the class instance
    this.handleChange = this.handleChange.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.callbackChecklist = this.callbackChecklist.bind(this);
    this.callbackReagents = this.callbackReagents.bind(this);
  }
  //GET request to retrieve an array of available experiments from the API server
  getApparatus = () => {
    const apparatusEndpoint = "https://icemlab.herokuapp.com/apparatus/";
    fetch(apparatusEndpoint, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          apparatusData: response.apparatus,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getReagents = () => {
    const reagentsEndpoint = "https://icemlab.herokuapp.com/reagent/";
    fetch(reagentsEndpoint, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          reagentsData: response.reagents,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //convert to array with title key
  processReagents = (reagents) => {
    const arr = reagents.map((item) => {
      return {
        title: item,
      };
    });

    return arr;
  };

  //format for the server
  processSelectedReagents = () => {
    const arr = this.state.selectedReagents.map((item) => {
      return typeof item === "object" ? item.title : item;
    });

    return arr;
  };

  //Sets the state of the checked array to include items that have been selected.
  callbackChecklist = (checked) => {
    this.setState({ checkedApparatus: checked });
  };
  callbackReagents = (selected) => {
    this.setState({ selectedReagents: selected });
  };
  //Calls method once the component has rendered
  componentDidMount() {
    this.getReagents();
    this.getApparatus();
    if (this.props.edit) {
      this.getExperiment(this.props.selection);
    } else {
      this.setState({ hidden: false });
    }
  }
  //retrieves the value of the user input as assigns it to the relevant state variable
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  validatePayload = () => {
    return (
      this.state.title !== "" &&
      this.state.preamble.information !== "" &&
      this.state.checkedApparatus.length !== 0 &&
      this.processSelectedReagents().length !== 0 &&
      this.state.method.length !== 0
    );
  };

  //PUT request to send the user input (Experiment upload details) to the API server
  putPayload = () => {
    const payload = {
      title: this.state.title,
      information: this.state.preamble,
      apparatus: this.state.checkedApparatus,
      reagents: this.processSelectedReagents(),
      method: this.state.method,
      notes: this.state.notes,
      category: this.state.courseCode,
      url: this.state.videoLink,
      image: this.state.image,
    };
    const url = "https://icemlab.herokuapp.com/experiment/";
    fetch(url, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(() => {
        this.setState({ upload: true }); //  alert
      })

      .catch((err) => {
        console.log(err);
      });
  };
  //Encode query parameters for a HTTP request
  encodeParameters = (params) => {
    let query = Object.keys(params)
      .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");
    return `?${query}`;
  };
  getExperiment = () => {
    const endpoint = "https://icemlab.herokuapp.com/experiment/";
    const query = {
      title: this.props.experimentTitle,
    };
    const url = endpoint + this.encodeParameters(query);
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          title: response.experiment.title,
          preamble: response.experiment.information,
          checkedApparatus: response.experiment.apparatus,
          selectedReagents: response.experiment.reagents,
          method: response.experiment.method,
          notes: response.experiment.notes,
          courseCode: response.experiment.category,
          videoLink: response.experiment.url,
          image: response.experiment.image,
          hidden: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //alert to notify the user that the experiment was uploaded successfully
  alertOnClose = () => {
    window.location.href = "/dashboard";
  };

  handleEditorChange(content, delta, source, editor) {
    this.setState({
      method: this.convertDecimalPoint(content),
    });
  }

  handleImageChange(content, delta, source, editor) {
    this.setState({
      image: content,
    });
  }

  convertDecimalPoint = (method) => {
    let arr = method.split("");
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === ".") {
        if (
          i - 1 >= 0 &&
          !isNaN(arr[i - 1]) &&
          i + 1 <= arr.length &&
          !isNaN(arr[i + 1])
        ) {
          arr[i] = ",";
        }
      }
    }
    return arr.join("");
  };

  render() {
    return (
      <div className="page">
        <Navigation></Navigation>

        <div className="container u-form">
          <div className="pageHeading">Experiment Upload</div>
          <hr /> {/*Splits up sections*/}
          <Form>
            {/*Div used for course specification */}
            <div className="u-div">
              <div className="ulabel">Course</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="courseCode">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Select the appropriate course code for this experiment.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Course Code</Form.Label>
                  </OverlayTrigger>
                  <Form.Control
                    as="select"
                    required={true}
                    name="courseCode"
                    value={this.state.courseCode}
                    onChange={this.handleChange}
                  >
                    <option>CEM1000W</option>
                    <option>CEM2005W</option>
                    <option>CEM3000W</option>
                  </Form.Control>
                </Form.Group>
              </div>
            </div>
            <hr />
            {/*Div used for all experiment details */}
            <div className="u-div">
              <div className="ulabel">Experiment Details</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="title">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Enter a title for this experiment. Note that this cannot
                        be changed once the experiment is uploaded.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Title</Form.Label>
                  </OverlayTrigger>
                  <Form.Control
                    placeholder="Enter Experiment Title"
                    required={true}
                    name="title"
                    value={this.state.title}
                    onChange={this.handleChange}
                    disabled={this.props.edit}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="preamble">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Enter a introduction, preamble or description for this
                        experiment into the text area.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Preamble</Form.Label>
                  </OverlayTrigger>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    placeholder="Enter Experiment Preamble"
                    required={true}
                    name="preamble"
                    value={this.state.preamble}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <div className="u-div">
                  <Form.Group as={Col} controlId="apparatus">
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip>
                          Select the requisite apparatus for this experiment
                          using this checklist.
                        </Tooltip>
                      }
                    >
                      <Form.Label>Apparatus</Form.Label>
                    </OverlayTrigger>
                    {!this.state.hidden ? (
                      <Checklist
                        data={this.state.apparatusData}
                        checked={this.state.checkedApparatus}
                        callback={this.callbackChecklist}
                        variant="upload"
                      />
                    ) : null}
                  </Form.Group>
                  <img src={main} height="350" alt="Graphic"></img>
                </div>
                <Form.Group as={Col} controlId="reagents">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Search for and select reagents for this experiment.
                        Typing into the component will display a list of
                        matching items. To delete a selection, click the button
                        on the reagent chip.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Reagents</Form.Label>
                  </OverlayTrigger>
                  {!this.state.hidden ? (
                    <ReagentInput
                      data={this.processReagents(this.state.reagentsData)}
                      selected={this.processReagents(
                        this.state.selectedReagents
                      )}
                      callback={this.callbackReagents}
                    />
                  ) : null}
                </Form.Group>
              </div>
            </div>
            <hr />
            {/*Div used for experiment method */}
            <div className="u-div">
              <div className="ulabel">Experiment Method</div>
              <div className="ucontent-div" style={{ height: "20rem" }}>
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Tooltip>
                      Enter a method for this experiment. Use the buttons in the
                      editor toolbar to add headings, text decoration, links and
                      formulas.
                    </Tooltip>
                  }
                >
                  <ReactQuill
                    theme="snow"
                    onChange={this.handleEditorChange}
                    modules={EDITOR_MODULES}
                    style={{ height: "16rem", marginLeft: "1rem" }}
                    value={this.state.method}
                  ></ReactQuill>
                </OverlayTrigger>
              </div>
            </div>
            <hr />
            <div className="u-div">
              <div className="ulabel">Generated Steps</div>
              <div
                className="ucontent-div"
                style={{ maxHeight: "20rem", overflowY: "scroll" }}
              >
                <ol>
                  {this.state.method
                    .split(".")
                    .slice(0, -1)
                    .map((item, index) => {
                      return (
                        <li
                          key={index}
                          dangerouslySetInnerHTML={{
                            __html: `${item}`,
                          }}
                        />
                      );
                    })}
                </ol>
              </div>
            </div>
            <hr />
            <div className="u-div">
              <div className="ulabel">Experiment Graphics</div>
              <div className="ucontent-div" style={{ height: "20rem" }}>
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Tooltip>
                      Upload an image or diagram for this experiment by clicking
                      on the Image button in the toolbar and add a caption or
                      description.
                    </Tooltip>
                  }
                >
                  <ReactQuill
                    theme="snow"
                    onChange={this.handleImageChange}
                    modules={IMAGE_MODULES}
                    style={{ height: "16rem", marginLeft: "1rem" }}
                    value={this.state.image}
                    placeholder={"Maximum image file size: 300KB"}
                  ></ReactQuill>
                </OverlayTrigger>
              </div>
            </div>
            <hr />
            {/*Div used for experiment video */}
            <div className="u-div">
              <div className="ulabel">Experiment Demonstration</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="videoLink">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Enter a URL for a video of a demonstration of this
                        experiment.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Video URL</Form.Label>
                  </OverlayTrigger>
                  <Form.Control
                    placeholder=""
                    required={true}
                    name="videoLink"
                    value={this.state.videoLink}
                    onChange={this.handleChange}
                  />
                </Form.Group>
              </div>
            </div>
            <hr />
            {/*Div used for additional notes*/}
            <div className="u-div">
              <div className="ulabel">Additional Notes</div>
              <div className="ucontent-div">
                <Form.Group as={Col} controlId="additionalNotes">
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip>
                        Enter additional notes or supplemental information for
                        this experiment.
                      </Tooltip>
                    }
                  >
                    <Form.Label>Notes</Form.Label>
                  </OverlayTrigger>
                  <Form.Control
                    as="textarea"
                    rows="6"
                    placeholder=""
                    name="notes"
                    value={this.state.notes}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Row
                  style={{
                    marginTop: "15px",
                  }}
                >
                  <Button
                    className="ubutton"
                    onClick={() => this.putPayload()} // Calling the PUT method to upload the experiment
                    disabled={!this.validatePayload()}
                    style={{
                      marginLeft: "30px",
                      backgroundColor: "#4E2E84",
                      border: "#4E2E84",
                      height: "50px",
                      width: "90px",
                    }}
                  >
                    {this.props.edit ? "Save " : "Upload"}
                  </Button>

                  <Alert //Indicating the upload success to the user
                    show={this.state.upload}
                    variant="success"
                    onClose={() => this.alertOnClose()}
                    dismissible
                    style={{
                      display: "flex",
                      marginLeft: "10px",
                    }}
                  >
                    <CheckIcon
                      style={{
                        marginRight: "5px",
                      }}
                    />
                    {this.props.edit
                      ? "Experiment Saved"
                      : "Experiment Uploaded"}
                  </Alert>
                </Row>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
export default Upload;
