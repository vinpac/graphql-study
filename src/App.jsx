import CodeMirror from 'codemirror';
import 'codemirror-graphql/mode';
import 'codemirror/lib/codemirror.css';
import React, { Component } from 'react';
import Output from './components/Output/Output.jsx';
import css from './App.scss';
import autobind from 'autobind-decorator';

const initialValue = `
# Paste or drop some GraphQL queries or schema
# definitions here and explore the syntax tree
# created by the GraphQL parser.


type Meta {
}

type Query {
  t: String,
  meta: Meta
}

query GetUser($userId: ID! = 3) {
  user(id: $userId) {
    id,
    name(name: enum),
    isViewerFriend,
    profilePicture(size: 50)  {
      t
    }
  }
}
`.trim();

class App extends Component {

  constructor(props) {
    super(props);


    this.state = { code: initialValue };
  }

  componentDidMount() {
    this.codeMirror = new CodeMirror(this.codeMirrorContainer, {
      value: initialValue,
      mode: 'graphql',
      tabSize: 2,
      lineNumbers: true,
      onChange: this.handleChange,
    });
    this.codeMirror.on('change', this.handleChange);

    // eslint-disable-next-line
    this.setState({ hasCodeMirrorInstance: true });
  }

  @autobind
  handleChange(doc, change) {
    if (change.origin !== 'setValue') {
      this.setState({ code: doc.getValue() });
    }
  }

  render() {
    const { code } = this.state;

    return (
      <div className={css.component}>
        <div className={css.editor}>
          <div className={css.codeMirror} ref={div => { this.codeMirrorContainer = div; }} />
        </div>
        <div className={css.output}>
          <Output code={code} codeMirrorInstance={this.codeMirror} />
        </div>
      </div>
    );
  }
}

export default App;
