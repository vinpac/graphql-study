import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import React from 'react';
import { parse } from '../../services/lang/parser';
import TreeItem from './components/TreeItem.jsx';
import css from './Output.scss';

class Output extends React.Component {
  static propTypes = {
    code: PropTypes.string,
    codeMirrorInstance: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      ast: this.parseCode(props.code),
    };
  }

  componentWillReceiveProps({ code, codeMirrorInstance }) {
    if (code !== this.props.code || codeMirrorInstance !== this.props.codeMirrorInstance) {
      this.setState({
        ast: this.parseCode(code, codeMirrorInstance),
      });
    }
  }

  parseCode(code, codeMirrorInstance = this.props.codeMirrorInstance) {
    try {
      const ast = parse(code || '');

      if (codeMirrorInstance) {
        codeMirrorInstance.doc.getAllMarks().forEach(mark => mark.clear());
      }

      return ast;
    } catch (error) {
      if (codeMirrorInstance) {
        const { start, end } = error;

        codeMirrorInstance.doc.markText({
          line: start.line - 1,
          ch: start.column - 1,
        }, {
          line: end.line - 1,
          ch: end.column - 1,
        },
        {
          className: css.errorInCode
        });
      }
      return { error };
    }
  }

  renderError(error) {
    if (/^Parser/.test(error.name)) {
      return (
        <div>
          {error.message}
        </div>
      );
    }

    return (
      <div>
        Error
      </div>
    );
  }

  renderAST() {
    const { ast } = this.state;
    return (
      <div>
        {this.renderASTElement(ast)}
      </div>
    );
  }

  @autobind
  addCodeHighlight(token, { isArray, isObject }) {
    const { codeMirrorInstance } = this.props;
    let start;
    let end;

    if (!isArray && !isObject) {
      return;
    }

    if (isObject) {
      if (!token.loc) {
        return;
      }

      start = {
        line: token.loc.start.line - 1,
        ch: token.loc.start.column - 1,
      };

      end = {
        line: token.loc.end.line - 1,
        ch: token.loc.end.column - 1,
      };
    } else {
      let i = 0;
      let firstMatch;
      for (; i < token.length; i += 1) {
        if (token[i].loc) {
          if (start) {
            end = {
              line: token[i].loc.end.line - 1,
              ch: token[i].loc.end.column - 1,
            };
          } else {
            start = {
              line: token[i].loc.start.line - 1,
              ch: token[i].loc.start.column - 1,
            };
            firstMatch = token[i];
          }
        }
      }

      if (!end && firstMatch) {
        end = {
          line: firstMatch.loc.end.line - 1,
          ch: firstMatch.loc.end.column - 1,
        };
      }
    }

    if (!start || !end) {
      return;
    }

    codeMirrorInstance.doc.markText(start, end, { className: css.highlightCode });
  }

  @autobind
  removeCodeHighlight() {
    const { codeMirrorInstance } = this.props;
    if (codeMirrorInstance) {
      codeMirrorInstance.doc.getAllMarks().forEach(mark => mark.clear());
    }
  }

  render() {
    const { ast } = this.state;
    let children;

    if (ast.error) {
      const { error } = ast;

      children = (
        <div className={css.error}>
          <div className={css.errorHeader}>
            <span>Error{error.name ? `: ${error.name}` : ''}</span>
          </div>
          <div className={css.errorBody}>
            {this.renderError(error)}
          </div>
        </div>
      );
    } else {
      children = (
        <div>
          <TreeItem
            isOpen
            token={ast}
            addCodeHighlight={this.addCodeHighlight}
            removeCodeHighlight={this.removeCodeHighlight}
          />
        </div>
      );
    }

    return (
      <div className={css.component}>
        {children}
      </div>
    );
  }
}

export default Output;
