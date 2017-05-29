// @flow

import Node from './Node';
import Source from './Source';
import Name from './Name';
import FieldDefinition from './FieldDefinition';

class ObjectTypeDefinition extends Node {
  static type = 'ObjectTypeDefinition';

  name: Name;
  fields: Array<FieldDefinition>;

  constructor(
    start: number,
    end: number,
    source: Source,
    name: Name,
    fields: Array<FieldDefinition>,
  ) {
    super(start, end, source);

    this.name = name;
    this.fields = fields;
  }
}

export default ObjectTypeDefinition;
