// @flow

import Node from './Node';
import Source from './Source';

class Name extends Node {
  static type = 'Name';

  value: string;

  constructor(start: number, end: number, source: Source, value: string) {
    super(start, end, source);

    this.value = value;
  }
}

export default Name;
