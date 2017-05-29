// @flow
/* eslint-disable import/prefer-default-export */

import Source from './Source';
import Location from './utils/Location';

export type Loc = {
  start: Location,
  end: Location,
  source: Source,
};

export interface NodeInterface {
  type: string;
  loc: Loc;
}

export default class Node {
  static type = 'Node';

  type: string;
  loc: Loc;

  constructor(start: number, end: number, source: Source) {
    this.type = this.constructor.type;
    this.loc = {
      start: new Location(source, start),
      end: new Location(source, end),
      source,
    };
  }
}
