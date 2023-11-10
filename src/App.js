import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { Compartment } from "@codemirror/state";
import { Tag } from "@lezer/highlight"
import { basicSetup, EditorView } from "codemirror";
import React, { createRef } from "react";
import './App.css';

const tokenTable = {
  'hello': Tag.define(),
  'space': Tag.define(),
  'world': Tag.define(),
  'invalid': Tag.define(),
}

const myLanguage = {
  name: 'my_language',
  tokenTable: tokenTable,

  startState: function (indent) {
    return { token: 1 };
  },

  token: function (stream, state) {
    if (state.token === 1 && stream.match('hello')) {
      state.token = 2;
      return 'hello';
    } else if (state.token === 2 && stream.match(' ')) {
      state.token = 3;
      return 'space';
    } else if (state.token === 3 && stream.match('world')) {
      state.token = 4;
      // console.log('successfully parsed');
      return 'world'
    } else {
      stream.skipToEnd();
      return 'invalid';
    }
  }
}

const myHighlightStyle = HighlightStyle.define(
  Object.keys(tokenTable).map(token => ({ tag: tokenTable[token], class: 'cm-' + token }))
);

const mySyntaxHighlighting = syntaxHighlighting(myHighlightStyle);


class App extends React.Component {
  constructor(props) {
    super(props);

    this.ref = createRef();
  }


  render() {
    return (
      <div ref={this.ref}>
      </div>
    );
  }

  componentDidMount() {
    const languageCompartment = new Compartment()

    this.cm = new EditorView({
      doc: 'hello world',
      extensions: [
        basicSetup,
        languageCompartment.of(StreamLanguage.define(myLanguage)),
        mySyntaxHighlighting
      ],
    })

    this.ref.current.appendChild(this.cm.dom);
    console.log(this.cm.contentDOM.innerHTML);

    for (let i = 1; i <= 50000; i++) {
      // console.log(i);
      this.cm.dispatch({
        // changes: { from: 0, to: this.cm.state.doc.length, insert: 'hello world' },
        effects: languageCompartment.reconfigure(StreamLanguage.define(myLanguage))
      })
      if (this.cm.contentDOM.innerHTML.indexOf('cm-hello') === -1) {
        console.error(i, this.cm.contentDOM.innerHTML);
        break;
      }
    }
  }

  componentWillUnmount() {
    this.cm.destroy();
  }
}

export default App;
