// @flow

class Source {
  name: ?string;
  body: string;

  constructor(body: string, name: ?string) {
    this.body = body;

    if (name) {
      this.name = name;
    }
  }
}

export default Source;
