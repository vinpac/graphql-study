// @flow

import Source from '../Source';

class Location {
  position: number;
  line: number;
  column: number;

  constructor(source: Source, position: number) {
    this.position = position;

    const lineRegexp = /\r\n|[\n\r]/g;
    let line = 1;
    let column = position + 1;
    let match = lineRegexp.exec(source.body);

    while (match && match.index < position) {
      line += 1;
      column = (position + 1) - (match.index + match[0].length);
      match = lineRegexp.exec(source.body);
    }

    this.line = line;
    this.column = column;
  }
}

export default Location;
