/* @flow */
/* eslint-disable import/prefer-default-export */


import Source from './types/Source';
import Location from './types/utils/Location';
import Token from './types/Token';

export class ParserError extends Error {
  source: Source;
  message: string;
  start: Location;
  end: Location;

  constructor(source: Source, start: number, end: number | string, message: ?string) {
    super(message);

    this.name = 'ParserSyntaxError';
    this.source = source;
    this.message = (typeof end === 'string' ? end : message) || '';
    this.start = new Location(source, start);
    this.end = new Location(source, typeof end === 'string' ? start : end);
  }

  toJSON() {
    return {
      name: this.name,
      source: this.source,
      message: this.message,
    };
  }
}

export class ParserSyntaxError extends ParserError {
  constructor(source: Source, position: number, description: ?string) {
    const location = new Location(source, position);

    super(
      source,
      position,
      `Syntax error ${source.name || ''} (${location.line}:${location.column})` +
      `${description ? ` ${description}` : ''}`,
    );
  }
}


export class ParserUnexpectedError extends ParserError {

  constructor(source: Source, token: Token, expected: ?string) {
    const location = new Location(source, token.start);
    const { type, value } = token;

    super(
      source,
      token.start,
      token.end,
      `${expected ? `Expected ${expected}, found` : 'Unexpected'} ` +
      `${type}${value ? ` "${value}"` : ''}` +
      `${source.name ? ` at ${source.name}` : ''} (${location.line}:${location.column})`,
    );

    this.name = 'ParserUnexpectedError';
  }
}
