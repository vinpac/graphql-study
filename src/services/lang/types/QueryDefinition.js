// @flow

import Node from './Node';
import Source from './Source';
import Name from './Name';
import Field from './Field';
import VariableDefinition from './VariableDefinition';

class QueryDefinition extends Node {
  static type = 'QueryDefinition';

  name: Name;
  fields: Array<Field>;
  variableDefinitions: Array<VariableDefinition>;

  constructor(
    start: number,
    end: number,
    source: Source,
    fields: Array<Field>,
    variableDefinitions: Array<VariableDefinition>,
    name: ?Name,
  ) {
    super(start, end, source);

    this.fields = fields;

    if (name) {
      this.name = name;
    }

    if (variableDefinitions) {
      this.variableDefinitions = variableDefinitions;
    }
  }
}

export default QueryDefinition;
