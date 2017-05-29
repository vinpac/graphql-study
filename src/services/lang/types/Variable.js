// @flow

import Node from './Node';
import Source from './Source';
import Name from './Name';

class Variable extends Node {
  static type = 'Variable';

  name: Name;

  constructor(start: number, end: number, source: Source, name: Name) {
    super(start, end, source);

    this.name = name;
  }
}

export default Variable;
