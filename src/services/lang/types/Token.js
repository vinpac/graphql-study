// @flow

class Token {
  type: string;
  start: number;
  end: number;
  line: number;
  value: ?string;

  constructor(type: string, start: number, end: number, line: number, value: ?string) {
    this.type = type;
    this.start = start;
    this.end = end;
    this.line = line;

    if (value) {
      this.value = value;
    }
  }
}

export default Token;
