import React from 'react';
import PropTypes from 'prop-types';

import {makeState} from './State';

function withFormState(schemaOrBuilder, isStateless = false) {
  return function(Component) {
    class FormState extends React.Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            formState: (typeof schemaOrBuilder === 'function') ?
              schemaOrBuilder(this.props) : makeState(schemaOrBuilder)
          };
        }

        getChildContext() {
          return {
            getFormState: () => this.state.formState,
            getFieldState: (name) => this.state.formState.child(name)
          }
        }

        componentWillReceiveProps(nextProps) {
          if (isStateless) {
            const dirty = this.state.formState.dirty;

            this.state = {
              formState: (typeof schemaOrBuilder === 'function') ?
                schemaOrBuilder(nextProps, dirty) : makeState(schemaOrBuilder, {}, dirty)
            };
          }
        }

        render() {
          return <Component {...this.props} formState={this.state.formState} />;
        }
    }
    FormState.childContextTypes = {
      getFormState: PropTypes.func,
      getFieldState: PropTypes.func
    };

    FormState.displayName = `withFormState/${Component.displayName}`;
    return FormState;
  }
}

export default withFormState;
