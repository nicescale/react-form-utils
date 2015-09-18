var React = require('react');

var FormMixin = {
  childContextTypes: {
    getFormState: React.PropTypes.func,
    getFieldState: React.PropTypes.func
  },

  getInitialState() {
    return {
      formState: this.getFormState()
    };
  },

  getChildContext() {
    return {
      getFormState: () => this.state.formState,
      getFieldState: (name) => this.state.formState.child(name)
    };
  }
};

module.exports = FormMixin;
