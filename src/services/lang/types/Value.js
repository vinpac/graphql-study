// @flow

import Node from './Node';
import Source from './Source';

class Value extends Node {
  static type = 'Value';

  value: string;

  constructor(start: number, end: number, source: Source, value: string) {
    super(start, end, source);

    this.value = value;
  }
}

export class IntValue extends Value {
  static type = 'IntValue';
}

export class FloatValue extends Value {
  static type = 'FloatValue';
}

export class StringValue extends Value {
  static type = 'StringValue';
}

export class BooleanValue extends Value {
  static type = 'BooleanValue';
}

export class EnumValue extends Value {
  static type = 'EnumValue';
}

export class NonNullValue extends Value {
  static type = 'IntValue';
}

export default Value;

