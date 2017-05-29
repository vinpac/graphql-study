// @flow

import Token from './Token';
import Source from './Source';
import { ParserSyntaxError } from '../errors';

export const SOF = '<SOF>';
export const EOF = '<EOF>';
export const BANG = '!';
export const DOLLAR = '$';
export const PAREN_L = '(';
export const PAREN_R = ')';
export const SPREAD = '...';
export const COLON = ':';
export const EQUALS = '=';
export const AT = '@';
export const BRACKET_L = '[';
export const BRACKET_R = ']';
export const BRACE_L = '{';
export const PIPE = '|';
export const BRACE_R = '}';
export const NAME = 'Name';
export const STRING = 'String';
export const COMMENT = 'Comment';
export const INT = 'Integer';
export const FLOAT = 'Float';
export const SEMICOLON = ';';

export type Lexer = {
  next: Function,
  previous: Function,
  position: number,
  line: number,
  lastToken: Token,
  token: Token,
  source: Source,
};

function readComment(lexer: Lexer, start: number, line: number): Token {
  const body = lexer.source.body;
  let position = start;
  let code;

  do {
    position += 1;
    code = body.charCodeAt(position);

  // not \n and not \r
  } while (position < body.length && code !== 10 && code !== 13);

  // Remove # from value
  const value = body.substr(start + 1, position - start - 1);

  return new Token(COMMENT, start, position, line, value);
}

function readName(lexer: Lexer, start: number, line: number): Token {
  const { body } = lexer.source;
  let position = start;
  let code;

  do {
    position += 1;
    code = body.charCodeAt(position);
  } while (position < body.length && (
    (code === 95) || // _
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) // a-z
  ));

  return new Token(NAME, start, position, line, body.substr(start, position - start));
}

function readNumber(lexer: Lexer, start: number, line: number): Token {
  const body = lexer.source.body;
  let position = start + 1;
  let code = body.charCodeAt(position);
  let isFloat = body.charCodeAt(start) === 46;

  // If starts with a dot and not nexted by a number throw error
  if (isFloat && !(code >= 48 && code <= 57)) {
    throw new ParserSyntaxError(lexer.source, position, `Unexpected ${body.charAt(position)}`);
  }

  while (position < body.length && (
    (code >= 48 && code <= 57) ||
    (code === 45 || code === 46)
  )) {
    if (!isFloat && code === 46) {
      isFloat = true;
    }

    position += 1;
    code = body.charCodeAt(position);
  }

  return new Token(
    isFloat ? FLOAT : INT, start,
    position,
    line,
    body.substr(start, position - start),
  );
}

function readString(lexer: Lexer, start: number, line: number): Token {
  const body = lexer.source.body;
  let position = start + 1;
  let code = body.charCodeAt(position);

  while (position < body.length) {
    // "
    if (code === 34) {
      break;
    }

    if (code === 10 || code === 13) {
      throw new ParserSyntaxError(lexer.source, position, 'Untermined string');
    }

    position += 1;
    code = body.charCodeAt(position);
  }

  const end = position + 1;

  return new Token(STRING, start, end, line, body.substr(start + 1, position - start - 1));
}

function positionAfterWhiteSpaces(lexer: Lexer) {
  const { body } = lexer.source;

  let { position, line } = lexer;
  let code = body.charCodeAt(position);

  while (position < body.length &&
    (
      // \t
      code === 9 ||
      // \n
      code === 10 ||
      // \r
      code === 13 ||
      // space
      code === 32 ||
      // ,
      code === 44
    )
  ) {
    if (code === 10 || code === 13) {
      line += 1;
    }

    position += 1;
    code = body.charCodeAt(position);
  }

  return { position, line };
}

function readToken(lexer: Lexer): Token {
  const { source: { body } } = lexer;
  const { position, line } = positionAfterWhiteSpaces(lexer);

  // Reach the end of the body by skiping whitespaces
  if (position >= body.length) {
    if (lexer.lastToken.type === EOF) {
      return lexer.lastToken;
    }

    return new Token(EOF, position, position, line);
  }

  const code: number = body.charCodeAt(position);

  switch (code) {
    // !
    case 33: return new Token(BANG, position, position + 1, line);
    // "
    case 34: return readString(lexer, position, line);
    // #
    case 35: return readComment(lexer, position, line);
    // $
    case 36: return new Token(DOLLAR, position, position + 1, line);
    // (
    case 40: return new Token(PAREN_L, position, position + 1, line);
    // )
    case 41: return new Token(PAREN_R, position, position + 1, line);
    // :
    case 58: return new Token(COLON, position, position + 1, line);
    // ;
    case 59: return new Token(SEMICOLON, position, position + 1, line);
    // =
    case 61: return new Token(EQUALS, position, position + 1, line);
    // {
    case 123: return new Token(BRACE_L, position, position + 1, line);
    // }
    case 125: return new Token(BRACE_R, position, position + 1, line);
    // A-Z _ a-z
    case 65: case 66: case 67: case 68: case 69: case 70: case 71: case 72:
    case 73: case 74: case 75: case 76: case 77: case 78: case 79: case 80:
    case 81: case 82: case 83: case 84: case 85: case 86: case 87: case 88:
    case 89: case 90:
    case 95:
    case 97: case 98: case 99: case 100: case 101: case 102: case 103: case 104:
    case 105: case 106: case 107: case 108: case 109: case 110: case 111:
    case 112: case 113: case 114: case 115: case 116: case 117: case 118:
    case 119: case 120: case 121: case 122:
      return readName(lexer, position, line);
    // - . 0-9
    case 45: case 46:
    case 48: case 49: case 50: case 51: case 52:
    case 53: case 54: case 55: case 56: case 57:
      return readNumber(lexer, position, line);

    default: throw new ParserSyntaxError(
      lexer.source,
      position,
      `"${body.charAt(position)}", char code: ${code}`,
    );
  }
}

function next({ includeComments }: { includeComments: ?boolean } = {}) {
  this.lastToken = this.token;
  const token = this.token;

  if (this.token.type !== EOF) {
    do {
      this.token = readToken(this, token);
      this.position = this.token.end;
      this.line = this.token.line;

    // Skip comments
    } while (this.token.type === COMMENT && !includeComments);

    return this.token;
  }

  return token;
}

function previous(lastToken: ?Token) {
  if (this.token.type !== SOF) {
    this.token = this.lastToken;
    this.position = this.token.end;
    this.line = this.token.line;

    if (lastToken) {
      this.lastToken = lastToken;
    }
  }
}

export function createLexer(rawSource: Source | string): Lexer {
  const source = rawSource instanceof Source ? rawSource : new Source(rawSource);
  const startOfFileToken = new Token(SOF, 0, 0, 0);

  return {
    next,
    previous,
    source,
    position: 0,
    line: 1,
    lastToken: startOfFileToken,
    token: startOfFileToken,
  };
}
