// @flow

import Node from './Node';
import Source from './Source';
import Name from './Name';
import Value from './Value';
import Variable from './Variable';

class Argument extends Node {
  static type = 'Argument';

  name: Name;
  value: Variable | Value;

  constructor(start: number, end: number, source: Source, name: Name, value: Variable | Value) {
    super(start, end, source);

    this.name = name;
    this.value = value;
  }
}

export default Argument;
