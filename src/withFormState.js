var React = require('react');

function withFormState(schemaBuilder) {
  return function(Component) {
    class FormState extends React.Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            formState: schemaBuilder(this.props)
          };
        }

        getChildContext() {
          return {
            getFormState: () => this.state.formState,
            getFieldState: (name) => this.state.formState.child(name)
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
