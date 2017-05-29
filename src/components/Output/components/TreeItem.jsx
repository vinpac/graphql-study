import autobind from 'autobind-decorator';
import cx from 'classnames';
import isObjectFn from 'is-object';
import isPlainObject from 'is-plain-object';
import PropTypes from 'prop-types';
import React from 'react';
import css from './TreeItem.scss';

// Makes type always come in the start and loc in the end
function sortProperties(a, b) {
  if (a === 'type' || b === 'type') {
    return b === 'type';
  }

  if (a === 'loc' || b === 'loc') {
    return a === 'loc';
  }

  if (a === 'source' || b === 'source') {
    return a === 'source';
  }

  return a > b;
}

class TreeItem extends React.Component {
  static propTypes = {
    token: PropTypes.any,
    name: PropTypes.string,
    isOpen: PropTypes.bool,
    addCodeHighlight: PropTypes.func,
    removeCodeHighlight: PropTypes.func,
  };

  constructor(props) {
    super(props);

    const { token } = props;
    const type = typeof token;
    const isNumber = type === 'number';
    const isBoolean = type === 'boolean';
    const isString = type === 'string';
    const isArray = !isString && Array.isArray(token);
    const isObject = !isArray && isObjectFn(token);
    const keys = isObject ? Object.keys(token).sort(sortProperties) : [];

    this.state = {
      isNumber,
      isBoolean,
      isString,
      isArray,
      isObject,
      keys,
      isClassInstance: isObject ? !isPlainObject(token) : false,
      hasChildren: isArray ? token.length !== 0 : keys.length !== 0,
      isOpen: !!props.isOpen,
    };
  }

  @autobind
  toggle() {
    const { isArray, isObject, isOpen } = this.state;

    if (isArray || isObject) {
      this.setState({ isOpen: !isOpen });
    }
  }

  renderValue() {
    const { token } = this.props;
    const { keys, isObject, isOpen, isBoolean, isArray } = this.state;

    if (isArray || isObject) {
      let text;

      if (isArray) {
        text = `${token.length} Element${token.length === 1 ? '' : 's'}`;
      } else {
        text = keys.slice(0, 3).join(', ');
        if (keys.length > 3) {
          text += `, ... +${keys.length - 3}`;
        }
      }

      if (!isOpen) {
        return (
          <span>
            {isArray ? '[' : '{'}
            <button onClick={this.toggle} className={css.childrenPreview}>
              {text}
            </button>
            {isArray ? ']' : '}'}
          </span>
        );
      }

      return null;
    }

    if (isBoolean) {
      return token ? 'true': 'false';
    }

    if (token === undefined) {
      return 'undefined';
    }

    if (token === null) {
      return 'null';
    }

    return token;
  }

  @autobind
  renderChild(child, key) {
    const { addCodeHighlight, removeCodeHighlight } = this.props;
    const { isArray } = this.state;

    return (
      <div className={css.child} key={key}>
        <TreeItem
          name={isArray ? undefined : key}
          token={child}
          isOpen={false}
          addCodeHighlight={addCodeHighlight}
          removeCodeHighlight={removeCodeHighlight}
        />
      </div>
    );
  }

  renderChildren() {
    const { token } = this.props;
    const { hasChildren, isArray, keys } = this.state;

    if (hasChildren) {
      return (
        <div className={css.children}>
          {isArray
            ? token.map(this.renderChild)
            : keys.map(key => this.renderChild(token[key], key))
          }
        </div>
      );
    }

    return null;
  }


  render() {
    const { name, token, addCodeHighlight, removeCodeHighlight } = this.props;
    const {
      isString,
      isNumber,
      isBoolean,
      isOpen,
      isClassInstance,
      isArray,
      isObject,
      hasChildren,
    } = this.state;

    return (
      <div
        className={cx(css.component, {
          [css.isOpen]: isOpen,
          [css.hasChildren]: hasChildren,
          [css.class]: isClassInstance && !name,
          [css.object]: isObject,
          [css.array]: isArray,
          [css.string]: isString,
          [css.number]: isNumber,
          [css.boolean]: isBoolean,
        })}
      >
        <div className={css.header}>
          <button
            onClick={this.toggle}
            className={css.name}
            onMouseEnter={addCodeHighlight && (
              () => addCodeHighlight(token, { isArray, isObject })
            )}
            onMouseLeave={removeCodeHighlight && (
              () => removeCodeHighlight(token, { isArray, isObject })
            )}
          >
            {name || token.constructor.name}
          </button>
          <span>
            <span className={css.valueSeparator}>:</span>
            {name && isClassInstance &&
              <button
                type="button"
                onClick={this.toggle}
                className={`${css.name} ${css.classInstanceName}`}
              >
                {token.constructor.name}
              </button>
            }
            <span className={css.value}>
              {this.renderValue()}
            </span>
          </span>
        </div>
        {isOpen && this.renderChildren()}
      </div>
    );
  }
}

export default TreeItem;
