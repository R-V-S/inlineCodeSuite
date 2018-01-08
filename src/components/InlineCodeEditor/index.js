import './style.scss'

import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/css/css'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/ruby/ruby'
import 'codemirror/mode/xml/xml'
import 'codemirror/keymap/sublime.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/display/autorefresh.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/theme/material.css'

import jshint from 'jshint'

export default class InlineCodeEditor {
  constructor ({ root, mode = 'javascript', theme = '', value = '', userValue = '', height, id, onChange = new Function, readOnly = false}) {

    // scaffold elements
    this.element = document.createElement('section')
    this.element.classList.add('inlineCodeEditor')
    this.element.dataset.id = id

    const editorElement = document.createElement('textarea')
    this.element.appendChild(editorElement)

    this.history = []
    this.historyIndex = 0

    this.defaultValue = value

    this.height = height

    // build out editor
    // NOTE: textarea must be appended before CodeMirror is initalized, otherwise: bugs.
    root.appendChild(this.element)
    editorElement.value = userValue
    
    let options = {
      autoCloseBrackets: true,
      autoRefresh: true,
      foldGutter: true,
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
      keyMap: 'sublime',
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      mode: mode,
      theme: `material inline-code-editor ${theme}`,
      readOnly: readOnly ? 'nocursor' : false,
      extraKeys: {
        Enter: (cm) => {
          // this does nothing. placeholder for future use
          return CodeMirror.Pass;
        },
        'Alt-Up': "swapLineUp",
        'Alt-Down': "swapLineDown",
      }
    }

    if (mode === 'javascript') { options.lint = this.lintJavascript }
    
    this.editor = CodeMirror.fromTextArea(editorElement, options)
    this.editor.setSize('100%', height)
    this.enableCollapsibleGutters()

    this.editor.on('changes', e => { 
      const input = this.editor.getValue()
      this.history.unshift( {
        value: input, 
        timestamp: Date.now()
      })
      this.historyIndex = 0
      onChange(e) 
    })
  }

  addOnRunSubscriber(subscriber) {
    this.onRunSubscribers.push(subscriber)
  }

  lintJavascript(text, options) {
    options.options = Object.assign({}, options.options,
      { asi: true, 
        curly: true, 
        esversion: 6, 
        undef: false,
        unused: false,
        loopfunc: true, 
        shadow: 'outer', 
        strict: 'implied', 
        validthis: true,
        "-W117": true // this disables the 'undefined variables. the undef option doesn't appear to work at this time.
    })
    options.globals = {
      'describe': true,
      'it': true,
      'expect': true,
      'document': true,
      'console': true,
      'inlineCodeSuite': true,
      
    }
    jshint.JSHINT(text, options.options, options.globals)
    return !jshint.JSHINT.data().errors ?
      [] :
      jshint.JSHINT.data().errors.map( (v) => {
        return {
          message: v.reason,
          severity: v.code[0] === 'W' ? 'warning' : 'error',
          from: CodeMirror.Pos(v.line - 1, v.character - 1),
          to: CodeMirror.Pos(v.line - 1, v.character)
        }
      })
  }

  enableCollapsibleGutters() {
    // TODO: Make button for todo
    const lintGutter = this.editor.display.gutters.querySelector('.CodeMirror-lint-markers')
    lintGutter.addEventListener('click', (e) => {
      this.editor.display.wrapper.classList.toggle('hide-the-lint')
    })
  }
  
  getValue() {
    return this.editor.getValue()
  }

  setValue(value) {
    this.editor.setValue(value)
  }

  getHistory() {
    return this.history
  }
  
  getMode() {
    return this.editor.options.mode
  }

  reset({ value = this.defaultValue, clearHistory = true} = {}) {
    this.setValue( value )
    
    // clear the history
    if (clearHistory) {
      this.editor.clearHistory()
    }
  }

  setFullscreen(isEnabled) {
    if (isEnabled) {
      this.editor.setSize('100%', 'calc(100vh - 65px)')
    } else {
      this.editor.setSize('100%', this.height)
    }
  }
}

