// @flow

import Node from './Node';
import Source from './Source';
import Name from './Name';
import NamedType from './NamedType';

class FieldDefinition extends Node {
  static type = 'FieldDefinition';

  name: Name;
  valueType: NamedType;

  constructor(start: number, end: number, source: Source, name: Name, valueType: NamedType) {
    super(start, end, source);

    this.name = name;
    this.valueType = valueType;
  }
}

export default FieldDefinition;
