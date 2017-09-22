import React from 'react';
import PropTypes from 'prop-types';

export default class Form extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleUpdate = this.handleUpdate.bind(this);

    const state = context.getFormState();
    state.attributes = state.attributes.set('onUpdate', this.handleUpdate);
    this.state = {
      state
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    var state = nextContext.getFormState();
    state.attributes = state.attributes.set('onUpdate', this.handleUpdate);
    this.setState({
      state
    });
  }

  handleUpdate() {
    this.props.onUpdate(this.state.state.value.toJS(), this.state.state.isValid());
  }

  render() {
    var {
      componentClass: ComponentClass,
      onUpdate: _,
      children,
      ...otherProps
    } = this.props;

    if (ComponentClass !== 'form') {
      delete otherProps['onSubmit'];
    }

    return (
      <ComponentClass {...otherProps}>
        {children}
      </ComponentClass>
    );
  }
}
Form.defaultProps = {
  componentClass: 'form',
  autoComplete: 'off',
  onSubmit: e => e.preventDefault()
}
Form.contextTypes = {
  getFormState: PropTypes.func
}
Form.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  autoComplete: PropTypes.oneOf(['off', 'on']).isRequired,
  componentClass: PropTypes.node.isRequired
}
