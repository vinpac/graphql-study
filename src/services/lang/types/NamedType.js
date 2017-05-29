// @flow

import Name from './Name';
import Node from './Node';

class NamedType extends Node {
  static type = 'NamedType';

  type: string = NamedType.type;
  name: Name;
  allowNull: boolean;

  constructor(name: Name, allowNull: boolean = true) {
    super(name.loc.start.position, name.loc.end.position, name.loc.source);

    this.name = name;
    this.allowNull = allowNull;
  }
}

export default NamedType;
