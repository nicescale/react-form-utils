import React from 'react';
import PropTypes from 'prop-types';

export default class Field extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.state = {
      state: context.getFieldState(props.name)
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      state: nextContext.getFieldState(nextProps.name)
    });
  }

  handleChange(event) {
    var value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked ? true : false;
    } else if (event.target.multiple) {
        var selectedOptions = event.target.selectedOptions ||
            Array.prototype.filter.call(event.target.options, o => o.selected);
      value = Array.prototype.map.call(selectedOptions, o => o.value);
    }
    var prevValue = this.state.state.value;
    var state = this.state.state.update(value).notify();
    this.setState({
      state: state
    }, () => {
      if (this.props.onUpdate) {
        this.props.onUpdate(value, prevValue);
      }
    });
  }

  handleBlur() {

  }

  renderHelp() {
    if (!this.state.state.isValid() && this.state.state.isDirty()) {
      return this.state.state.validation;
    }

    return (this.props.help === true ? "" : this.props.help);
  }

  renderError() {
    return (!this.state.state.isValid() && this.state.state.isDirty()) ?
      'error' : null;
  }

  render() {
    var extraProps = {
      name: this.props.name,
      required: this.state.state.schema.required,
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      value: this.state.state.value,
      bsStyle: this.renderError()
    };
    if (this.props.help) {
      extraProps.help = this.renderHelp();
    }
    if (this.props.label) {
      extraProps.label = this.props.label;
    }
    var child = React.Children.only(this.props.children);
    if (child.props.type === 'radio') {
      extraProps.checked = extraProps.value === child.props.value;
      delete extraProps.value;
    } else if (child.props.type === 'checkbox') {
      extraProps.checked = extraProps.value === true;
      delete extraProps.value;
    }

    return React.cloneElement(child, extraProps);
  }

}
Field.defaultProps = {
  help: true,
  externalValidation: true
}
Field.contextTypes = {
  getFieldState: PropTypes.func
}
Field.propTypes = {
  name: PropTypes.string.isRequired,
  externalValidation: PropTypes.any,
  onUpdate: PropTypes.func,
  help: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  label: PropTypes.node
}
