// @flow

import Node from './Node';
import Source from './Source';
import Argument from './Argument';
import Name from './Name';

class Field extends Node {
  static type = 'Field';

  name: Name;
  arguments: Array<Argument>;
  fields: Array<Field>;

  constructor(
    start: number,
    end: number,
    source: Source,
    name: Name,
    args: ?Array<Argument>,
    fields: ?Array<Field>,
  ) {
    super(start, end, source);

    this.name = name;
    this.arguments = args || [];
    this.fields = fields || [];
  }
}

export default Field;
