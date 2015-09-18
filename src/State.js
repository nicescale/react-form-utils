"use strict";

var {Record, Map, OrderedMap, Iterable} = require('immutable');
var Messages = require('./Messages');


var emptyFunc = function() {};
var emptyValidator = function() {return true;};

var defaultValidator = function(value, props) {
  var active = props.get('required', false);
  if (active && (value === null || value === undefined || value === '')) {
    return new Error(Messages.VALUE_IS_REQUIRED);
  }
  return true;
};

var Property = Record({
  props: Map(),
  defaultValue: null,
  validator: null
});

var makeValidator = function(validators) {
  return function(value, props) {
    var result = true;
    validators.forEach(validator => {
      if (result !== true) {
        return;
      }

      var err;
      try {
        err = validator(value, props);
      } catch (ex) {
        err = ex;
      }
      if (err && err.message) {
        err = err.message;
      }
      if (err !== true) {
        result = err;
      }
    });
    return result;
  };
};

var makeProperty = function(props) {
  props = props || {};
  props = Map((props instanceof Iterable) ? props.toJS(): props);
  return Property({
    props: props,
    defaultValue: props.get('defaultValue', null),
    validator: makeValidator([defaultValidator, props.get('validator') || emptyValidator])
  });
};

var StateAttributes = Record({
  schema: OrderedMap(),
  value: Map(),
  validation: Map(),
  onUpdate: emptyFunc,
  dirty: Map()
}, 'StateAttributes');

class FieldState {
  constructor(parent, path) {
    this.parent = parent;
    this.path = path;
  }

  update(newValue) {
    this.parent.update(newValue, this.path);
    return this;
  }

  notify() {
    this.parent.notify();
    return this;
  }

  updateValidation(result) {
    this.parent.updateValidation(result, this.path);
    return this;
  }

  reset(attributes) {
    this.parent.reset(this.path, attributes);
    return this;
  }

  isDirty() {
    return this.dirty === true;
  }

  isValid() {
    return this.validation === true;
  }
}

Object.defineProperty(FieldState.prototype, 'value', {
  get() {
    return this.parent.value.getIn(this.path);
  }
});

Object.defineProperty(FieldState.prototype, 'schema', {
  get() {
    return this.parent.schema.getIn(this.path);
  }
});

Object.defineProperty(FieldState.prototype, 'validation', {
  get() {
    return this.parent.validation.getIn(this.path);
  }
});

Object.defineProperty(FieldState.prototype, 'dirty', {
  get() {
    return this.parent.dirty.getIn(this.path);
  }
});

class State {
  constructor(attributes) {
    this.attributes = attributes;
  }

  child(name) {
    return new FieldState(this, [name]);
  }

  update(newValue, path) {
    var property = this.schema.getIn(path);
    var result = property.validator(newValue, property.props);

    var validation = this.attributes.validation.setIn(path, result);
    var value = this.attributes.value.setIn(path, newValue);
    var dirty = this.attributes.dirty.setIn(path, true);

    this.attributes = this.attributes
      .set('validation', validation)
      .set('value', value)
      .set('dirty', dirty);
    return this;
  }

  reset(path, attributes) {
    var property = this.schema.getIn(path);

    attributes = Map(attributes);

    var newValidation = attributes.get('validation', true);
    var newDirtyState = attributes.get('dirty', false);
    var newValue = attributes.get('value', property.defaultValue);

    var validation = this.attributes.validation.setIn(path, newValidation);
    var dirty = this.attributes.dirty.setIn(path, newDirtyState);
    var value = this.attributes.value.setIn(path, newValue);
    this.attributes = this.attributes
      .set('validation', validation)
      .set('value', value)
      .set('dirty', dirty);
    return this;
  }

  updateValidation(result, path) {
    var validation = this.attributes.validation.setIn(path, result);
    this.attributes = this.attributes.set('validation', validation);
    return this;
  }

  isDirty() {
    return this.dirty.some(d => d === true);
  }

  isValid() {
    return this.validation.every(v => v === true);
  }

  notify() {
    this.attributes.onUpdate(this.value);
    return this;
  }
}

Object.defineProperty(State.prototype, 'schema', {
  get() {
    return this.attributes.schema;
  }
});

Object.defineProperty(State.prototype, 'value', {
  get() {
    return this.attributes.value;
  }
});

Object.defineProperty(State.prototype, 'validation', {
  get() {
    return this.attributes.validation;
  }
});

Object.defineProperty(State.prototype, 'dirty', {
  get() {
    return this.attributes.dirty;
  }
});

var makeSchema = function(schema, defaultValue) {
  var validation = {};
  var value = {};

  schema = schema.withMutations(function(s) {
    s.keySeq().toArray().forEach(k => {
      var property = makeProperty(s.get(k));
      s.set(k, property);
      value[k] = defaultValue[k] || s.get(k).props.get('defaultValue', null);
      validation[k] = property.validator(value[k], property.props);
    });
    return s;
  });
  validation = Map(validation);
  value = Map(value);
  return {schema, validation, value};
};

var makeState = function(rawSchema, rawValue) {
  var {schema, validation, value} = makeSchema(rawSchema, rawValue || {});
  var attributes = new StateAttributes({
    schema: schema,
    value: value,
    validation: validation,
    dirty: Map()
  });
  return new State(attributes);
};


module.exports = {State, makeState, makeProperty, FieldState};
