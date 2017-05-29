// @flow

import Node from './Node';
import Source from './Source';
import ObjectTypeDefinition from './ObjectTypeDefinition';
import QueryDefinition from './QueryDefinition';

export type definitionType = ObjectTypeDefinition | QueryDefinition;
class Document extends Node {
  static type = 'Document';

  definitions: Array<definitionType>;

  constructor(start: number, end: number, source: Source, definitions: ?Array<definitionType>) {
    super(start, end, source);

    this.definitions = definitions || [];
  }

}

export default Document;
