// @flow

import Node from './Node';
import Source from './Source';
import Variable from './Variable';
import NamedType from './NamedType';
import Value from './Value';

class VariableDefinition extends Node {
  static type = 'VariableDefinition';

  variable: Variable;
  variableType: NamedType;
  defaultValue: ?Value;

  constructor(
    start: number,
    end: number,
    source: Source,
    variable: Variable,
    variableType: NamedType,
    defaultValue: ?Value,
  ) {
    super(start, end, source);

    this.variable = variable;
    this.variableType = variableType;
    this.defaultValue = defaultValue;
  }
}

export default VariableDefinition;
