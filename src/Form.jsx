var React = require('react');

var FormContextMixin = {
  contextTypes: {
    getFormState: React.PropTypes.func
  }
};

var FieldContextMixin = {
  contextTypes: {
    getFieldState: React.PropTypes.func
  }
};

var Field = React.createClass({
  mixins: [
    FieldContextMixin
  ],

  propTypes: {
    name: React.PropTypes.string.isRequired,
    externalValidation: React.PropTypes.any,
    onUpdate: React.PropTypes.func,
    help: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool
    ]),
    label: React.PropTypes.node
  },

  getDefaultProps() {
    return {
      help: true,
      externalValidation: true
    };
  },

  getInitialState() {
    return {
      state: this.context.getFieldState(this.props.name)
    };
  },

  handleChange(event) {
    var value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked ? value : null;
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
  },

  handleBlur() {

  },

  renderHelp() {
    if (!this.state.state.isValid() && this.state.state.isDirty()) {
      return this.state.state.validation;
    }

    return (this.props.help === true ? "" : this.props.help);
  },

  renderError() {
    return (!this.state.state.isValid() && this.state.state.isDirty()) ?
      'error' : null;
  },

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
    if (child.props.type === 'radio' || child.props.type === 'checkbox') {
      extraProps.checked = extraProps.value === child.props.value;
      delete extraProps.value;
    }

    return React.cloneElement(child, extraProps);
  }
});

var Form = React.createClass({
  mixins: [
    FormContextMixin
  ],

  propTypes: {
    onUpdate: React.PropTypes.func.isRequired,
    autoComplete: React.PropTypes.oneOf(['off', 'on']).isRequired,
    componentClass: React.PropTypes.node.isRequired
  },

  getInitialState() {
    var state = this.context.getFormState();
    state.attributes = state.attributes.set('onUpdate', this.onUpdate);
    return {
      state: state
    };
  },

  getDefaultProps() {
    return {
      componentClass: 'form',
      autoComplete: 'off'
    };
  },

  onUpdate() {
    this.props.onUpdate(this.state.state.value.toJS(), this.state.state.isValid());
  },

  render() {
    var ComponentClass = this.props.componentClass;
    return (
      <ComponentClass {...this.props}>
        {this.props.children}
      </ComponentClass>
    );
  }
});

module.exports = {
  Field,
  Form
};