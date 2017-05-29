// @flow
/* eslint-disable import/prefer-default-export */

import {
  BANG,
  BRACE_L,
  BRACE_R,
  COLON,
  DOLLAR,
  EOF,
  EQUALS,
  FLOAT,
  INT,
  NAME,
  PAREN_L,
  PAREN_R,
  STRING,
  createLexer,
} from './types/lexer';

import type { Lexer } from './types/lexer';
import type { definitionType } from './types/Document';

import Source from './types/Source';
import { ParserSyntaxError, ParserUnexpectedError } from './errors';
import ObjectTypeDefinition from './types/ObjectTypeDefinition';
import Field from './types/Field';
import Token from './types/Token';
import Name from './types/Name';
import Argument from './types/Argument';
import Value, { BooleanValue, EnumValue, FloatValue, IntValue, StringValue } from './types/Value';
import FieldDefinition from './types/FieldDefinition';
import Document from './types/Document';
import QueryDefinition from './types/QueryDefinition';
import NamedType from './types/NamedType';
import Variable from './types/Variable';
import VariableDefinition from './types/VariableDefinition';

function validateTokens(lexer: Lexer, expectedTypes: Array<string>): Array<Token> {
  const tokens: Array<Token> = [];
  let token = lexer.token;

  expectedTypes.forEach(expectedType => {
    if (token.type !== expectedType) {
      throw new ParserUnexpectedError(lexer.source, token, expectedType);
    }

    tokens.push(token);
    token = lexer.next();
  });

  return tokens;
}

const typeToClassMap = {
  [INT]: IntValue,
  [FLOAT]: FloatValue,
  [STRING]: StringValue,
  [NAME]: EnumValue,
};

function parseVariable(lexer): Variable {
  const { source } = lexer;
  const [dollar, nameToken] = validateTokens(lexer, [DOLLAR, NAME]);

  if (!nameToken.value) {
    throw new ParserSyntaxError(source, nameToken.start, 'Missing value on variable');
  }

  return new Variable(
    dollar.start,
    nameToken.end,
    source,
    new Name(nameToken.start, nameToken.end, source, nameToken.value),
  );
}

function parseValue(lexer): Value {
  const { source } = lexer;
  const { token } = lexer;

  if (Object.hasOwnProperty.call(typeToClassMap, token.type)) {
    lexer.next();
    let ValueClass = typeToClassMap[token.type];

    if (token.type === NAME && (token.value === 'true' || token.value === 'false')) {
      ValueClass = BooleanValue;
    }

    if (!token.value) {
      throw new ParserSyntaxError(source, token.start, 'Missing value on token');
    }

    return new ValueClass(token.start, token.end, source, token.value);
  }

  throw new ParserUnexpectedError(source, token);
}

function parseFieldArgument(lexer: Lexer): Argument {
  const { source } = lexer;
  const start: number = lexer.token.start;
  const nameToken: Token = validateTokens(lexer, [NAME, COLON])[0];
  const name: Name = new Name(nameToken.start, nameToken.end, source, nameToken.value || '');
  const { token } = lexer;
  let value: Variable | Value;

  if (token.type === DOLLAR) {
    value = parseVariable(lexer);
  } else {
    value = parseValue(lexer);
  }

  return new Argument(start, lexer.lastToken.end, source, name, value);
}

function parseField(lexer: Lexer): Field {
  const { source } = lexer;
  const args: Argument[] = [];
  const start: number = lexer.token.start;
  const fields: Array<Field> = [];
  let { token } = lexer;

  if (token.type !== NAME) {
    throw new ParserUnexpectedError(source, token, NAME);
  }

  const name: Name = new Name(token.start, token.end, source, token.value || '');
  token = lexer.next();

  if (token.type === PAREN_L) {
    lexer.next();

    while (lexer.token.type !== EOF) {
      token = lexer.token;

      if (token.type === PAREN_R) {
        token = lexer.next();
        break;
      }

      args.push(parseFieldArgument(lexer));
    }
  }

  if (token.type === BRACE_L) {
    lexer.next();

    while (lexer.token.type !== EOF) {
      token = lexer.token;

      if (token.type === BRACE_R) {
        token = lexer.next();
        break;
      }

      fields.push(parseField(lexer));
    }
  }

  return new Field(start, lexer.lastToken.end, source, name, args, fields);
}

function parseFieldDefinition(lexer: Lexer): FieldDefinition {
  const { source } = lexer;
  const start: number = lexer.token.start;

  const [nameToken, , valueToken] = validateTokens(lexer, [NAME, COLON, NAME]);

  const name: Name = new Name(nameToken.start, nameToken.end, source, nameToken.value || '');
  const valueType: NamedType = new NamedType(
    new Name(valueToken.start, valueToken.end, source, valueToken.value || ''),
  );

  return new FieldDefinition(start, lexer.lastToken.end, source, name, valueType);
}

function parseTypeDefinition(lexer: Lexer): ObjectTypeDefinition {
  const { source } = lexer;
  const start: number = lexer.token.start;
  const fields: Array<FieldDefinition> = [];
  const [, nameToken] = validateTokens(lexer, [NAME, NAME, BRACE_L]);
  const name = new Name(nameToken.start, nameToken.end, source, nameToken.value || '');

  let { token } = lexer;

  while (lexer.token.type !== EOF) {
    token = lexer.token;

    if (token.type === BRACE_R) {
      token = lexer.next();
      break;
    }

    fields.push(parseFieldDefinition(lexer));
  }

  return new ObjectTypeDefinition(start, lexer.lastToken.end, source, name, fields);
}

function parseVariableDefinition(lexer: Lexer): VariableDefinition {
  const { source } = lexer;
  const start = lexer.token.start;
  let defaultValue: ?Value;

  let allowNull = true;

  const [dollarToken, nameToken, , typeToken] = validateTokens(lexer, [DOLLAR, NAME, COLON, NAME]);

  if (lexer.token.type === BANG) {
    allowNull = false;

    lexer.next();
  }

  if (lexer.token.type === EQUALS) {
    // Skip =
    lexer.next();
    defaultValue = parseValue(lexer);
  }

  return new VariableDefinition(
    start,
    lexer.lastToken.end,
    source,
    new Variable(
      dollarToken.start,
      nameToken.end,
      source,
      new Name(nameToken.start, nameToken.end, source, nameToken.value || ''),
    ),
    new NamedType(
      new Name(typeToken.start, typeToken.end, source, typeToken.value || ''),
      allowNull,
    ),
    defaultValue,
  );
}

function parseQueryDefinition(lexer: Lexer): QueryDefinition {
  const { source } = lexer;
  const start = lexer.token.start;
  const fields: Array<Field> = [];
  const variableDefinitions: Array<VariableDefinition> = [];
  let token: Token = lexer.next();
  let name: Name;

  if (token.type === NAME) {
    name = new Name(token.start, token.end, source, token.value || '');
    token = lexer.next();
  }

  if (token.type === PAREN_L) {
    lexer.next();

    while (lexer.token.type !== EOF) {
      token = lexer.token;

      if (token.type === PAREN_R) {
        token = lexer.next();
        break;
      }

      variableDefinitions.push(parseVariableDefinition(lexer));
    }
  }

  if (token.type === BRACE_L) {
    lexer.next();

    while (lexer.token.type !== EOF) {
      token = lexer.token;

      if (token.type === BRACE_R) {
        token = lexer.next();
        break;
      }

      fields.push(parseField(lexer));
    }
  }

  return new QueryDefinition(start, lexer.lastToken.end, source, fields, variableDefinitions, name);
}

export function parse(rawSource: Source | string): Document {
  const lexer: Lexer = createLexer(rawSource);
  const definitions: Array<definitionType> = [];
  const start = lexer.token.start;

  // Skip <SQF>
  lexer.next();

  // While haven't reach the end of file
  while (lexer.token.type !== EOF) {
    const { token } = lexer;

    switch (token.type) {
      case NAME:
        switch (token.value) {
          case 'type':
            definitions.push(parseTypeDefinition(lexer));
            break;
          case 'query':
            definitions.push(parseQueryDefinition(lexer));
            break;
          default:
            throw new ParserUnexpectedError(lexer.source, token);
        }
        break;
      default:
        throw new ParserUnexpectedError(lexer.source, token);
    }
  }

  return new Document(start, lexer.token.end, lexer.source, definitions);
}
