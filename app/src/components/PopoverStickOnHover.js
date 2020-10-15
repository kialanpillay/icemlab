import React from "react";
import PropTypes from "prop-types";
import { Overlay } from "react-bootstrap";
import Tooltip from "react-bootstrap/Tooltip";

//Custom Popover component to display additional apparatus or reagent information
export default class PopoverStickOnHover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopover: false,
    };
    //Binding of methods to the class instance
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  //Handles MouseEnter actions
  handleMouseEnter() {
    const { delay, onMouseEnter } = this.props;

    this.setTimeoutConst = setTimeout(() => {
      this.setState({ showPopover: true }, () => {
        if (onMouseEnter) {
          onMouseEnter();
        }
      });
    }, delay);
  }

  //Handles MouseLeave actions
  handleMouseLeave() {
    clearTimeout(this.setTimeoutConst);
    this.setState({ showPopover: false });
  }

  //Calls method once the component has unmounted
  componentWillUnmount() {
    if (this.setTimeoutConst) {
      clearTimeout(this.setTimeoutConst);
    }
  }

  render() {
    let { component, children, placement } = this.props;

    const child = React.Children.map(children, (child) =>
      React.cloneElement(child, {
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave,
        ref: (node) => {
          this._child = node;
          const { ref } = child;
          if (typeof ref === "function") {
            ref(node);
          }
        },
      })
    )[0];

    return (
      <React.Fragment>
        {child}
        <Overlay
          show={this.state.showPopover}
          placement={placement}
          target={this._child}
          shouldUpdatePosition={true}
        >
          <Tooltip
            onMouseEnter={() => {
              this.setState({ showPopover: true });
            }}
            onMouseLeave={this.handleMouseLeave}
            id="popover"
          >
            {component}
          </Tooltip>
        </Overlay>
      </React.Fragment>
    );
  }
}

PopoverStickOnHover.defaultProps = {
  delay: 0,
};

PopoverStickOnHover.propTypes = {
  delay: PropTypes.number,
  onMouseEnter: PropTypes.func,
  children: PropTypes.element.isRequired,
  component: PropTypes.node.isRequired,
};
