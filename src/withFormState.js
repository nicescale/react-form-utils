var React = require('react');

var makeState = require('./State').makeState;

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
            this.state = {
              formState: (typeof schemaOrBuilder === 'function') ?
                schemaOrBuilder(nextProps) : makeState(schemaOrBuilder)
            };
          }
        }

        render() {
          return <Component {...this.props} formState={this.state.formState} />;
        }
    }
    FormState.childContextTypes = {
      getFormState: React.PropTypes.func,
      getFieldState: React.PropTypes.func
    };

    FormState.displayName = `withFormState/${Component.displayName}`;
    return FormState;
  }
}

module.exports = withFormState;
