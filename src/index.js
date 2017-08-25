import './style.scss'

import InlineCodeEditor from './components/InlineCodeEditor'
import InlineCodePreview from './components/InlineCodePreview'
import InlineCodeConsole from './components/InlineCodeConsole'
import InlineCodeCompiler from './components/InlineCodeCompiler'

export default class InlineCodeSuite {
  constructor ({ root, editors, scripts, autoRun = true, name, height = '300px' }) {
    this.includeScripts = scripts.filter( script => !script.runButton )
    this.runScripts = scripts.filter( script => script.runButton )

    this.autoRun = autoRun
    this.name = name
    this.editors = editors
    
    this.height = Number.isInteger(height) ? `${height}px` : height
    
    this.scaffoldElements({ root: root, editorCount: this.editors.length })
    
    this.runScripts.forEach( script => this.createScriptRunButton({ script: script }) )
    
    // create editors
    for (let i in this.editors) {
      this.renderEditor({ editor: this.editors[i], index: i })
    }
    
    this.activeId = this.editors[0].id
    this.activeFocusButton().classList.add('active')
    
    this.console = new InlineCodeConsole({
      root: this.elements.outputScroller
      , height: this.height
    })

    this.compiler = new InlineCodeCompiler({ console: this.console })
    
    this.createPreview()
    
    this.createOutputButtons()

    if (!this.preview) { this.showConsole() }
    
    this.updateOutput()
  }
  
  activeFocusButton() {
    return this.elements.buttons.focus.find( b => b.dataset.id === this.activeId)
  }
  
  mergedScripts(editors, scripts) {
    let validScriptTypes = ['javascript']
    editors.forEach( editor => {
      if( validScriptTypes.includes( editor.rendered.getMode() ) && editor.preview !== false ) { 
        scripts.push({ type: 'text/javascript', value: editor.rendered.getValue() })
      }
    })
    
    return scripts
  }
  
  content(editors) {
    let htmleditor = editors.find( editor => this.isHtml(editor) )
    if (!htmleditor) { return }
    return htmleditor.rendered.getValue()
  }
  
  createFocusButton({ editor, index }) {
    let button = document.createElement('button')
    button.textContent = editor.name || editor.mode
    button.dataset.id = editor.id
    this.elements.focusButtonSection.append(button)
    button.onclick = e => {
      this.elements.editorScroller.style.transform = `translateX(-${index * (100 / this.editors.length)}%)`
      this.activeFocusButton().classList.remove('active')
      button.classList.add('active')
      this.activeId = button.dataset.id
    }
    
    this.elements.buttons.focus.push(button)
    
    return button
  }

  createOutputButtons() {
    this.consoleButton = document.createElement('button')
    this.consoleButton.textContent = 'Console'
    this.elements.outputButtonSection.append(this.consoleButton)
    
    this.consoleButton.onclick = e => {
      this.showConsole()
    }

    if (!this.preview) { return }
    this.previewButton = document.createElement('button')
    this.previewButton.textContent = 'Preview'
    this.previewButton.classList.add('active')
    this.elements.outputButtonSection.append(this.previewButton)

    this.previewButton.onclick = e => {
      this.showPreview()
    }
  }

  createPreview() {
    if ( !this.content(this.editors) ) { return }
    this.preview = new InlineCodePreview({ 
      root: this.elements.outputScroller
    , height: this.height
    , scripts: this.mergedScripts(this.editors, this.includeScripts)
    , stylesheets: this.stylesheets(this.editors)
    , content: this.content(this.editors) 
  })
  }

  showConsole() {
    this.elements.outputScroller.style.transform = `translateX(0%)`
    this.consoleButton.classList.add('active')
    if (this.preview) { this.previewButton.classList.remove('active') }
  }

  showPreview() {
    this.elements.outputScroller.style.transform = `translateX(-50%)`
    this.previewButton.classList.add('active')
    this.consoleButton.classList.remove('active')
  }
  
  createEditorRunButton({ editor }) {
    let button = document.createElement('button')
    button.textContent = editor.runButton || 'RUN'
    button.dataset.id = editor.id
    this.elements.runButtonSection.append(button)
    
    button.onclick = e => {
      let mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
      let mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '') + editor.rendered.getValue()
      this.runScript({ script: mergedScript })
    }
    
    this.elements.buttons.focus.push(button)
  }

  createScriptRunButton({ script }) {
    let button = document.createElement('button')
    button.textContent = script.runButton
    this.elements.runButtonSection.append(button)
    
    button.onclick = e => {
      let mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
      let mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '') + script.value
      this.runScript({ script: mergedScript })
    }
    
    this.elements.buttons.focus.push(button)
  }
  
  renderEditor({ editor, index }) {
    editor.id = this.id()
    
    this.createFocusButton({ editor: editor, index: index })
    if (editor.runButton) { this.createEditorRunButton({ editor: editor }) }
    
    editor.rendered = new InlineCodeEditor({ 
        root: this.elements.editorScroller
      , mode: editor.mode
      , name: editor.name
      , id: editor.id 
      , height: this.height
      , theme: editor.theme
      , value: editor.value
      , onChange: e => { if (this.autoRun) { this.updateOutput(e) } }
    })
    
    editor.rendered.element.style.width = `${100 / this.editors.length}%`
  }

  runScript({ script: script, clear = true, showConsole = true }) {
    let compiled = this.compiler.compile({
      code: script,
      logOnly: true
    })
    if (clear) { this.console.clear() }
    this.console.appendOutput( compiled.output )
    if (showConsole) { this.showConsole() }
  }

  runEditorScripts() {
    let validScriptTypes = ['javascript']
    this.editors.forEach( editor => {
      if( validScriptTypes.includes( editor.rendered.getMode() ) && editor.preview !== false ) { 
        this.runScript({ script: editor.rendered.getValue(), clear: false, showConsole: false })
      }
    })
  }
  
  id() {
    return Math.random().toString(36).substr(2)
  }
  
  isHtml(editor) {
    return /^html/.test( editor.rendered.getMode() )
  }
  
  scaffoldElements({ root, editorCount }) {
    this.elements = {}
    this.elements.root = document.createElement('section')
    this.elements.root.classList.add('inlineCodeSuite')
    if (this.name) { this.elements.root.setAttribute('id', `inlineCodeSuite-${this.name}`) }
    root.append( this.elements.root )
    
    this.elements.buttons = {}
    this.elements.buttons.run = []
    this.elements.buttons.focus = []
    
    this.elements.buttonSection = this.createElement({ 
        tag: 'section'
      , classes: 'inlineCodeSuite-buttons'
      , parent: this.elements.root
    })

    this.elements.focusButtonSection = this.createElement({ 
        tag: 'section'
      , classes: 'inlineCodeSuite-focus-buttons'
      , parent: this.elements.buttonSection
    })

    this.elements.outputButtonSection = this.createElement({ 
        tag: 'section'
      , classes: 'inlineCodeSuite-output-buttons'
      , parent: this.elements.buttonSection
    })
    
    this.elements.editorSection = this.createElement({
        tag: 'section'
      , classes: 'inlineCodeSuite-editors'
      , parent: this.elements.root
    })
    
    this.elements.editorScroller = this.createElement({
        tag: 'div'
      , classes: 'inlineCodeSuite-editor-scroller'
      , parent: this.elements.editorSection
      , styles: {
            height: this.height
          , width: `${100 * editorCount}%`
        }
    })

    this.elements.outputSection = this.createElement({
        tag: 'section'
      , classes: 'inlineCodeSuite-output'
      , parent: this.elements.root
    })
    
    this.elements.outputScroller = this.createElement({
        tag: 'section'
      , classes: 'inlineCodeSuite-output-scroller'
      , parent: this.elements.outputSection
      , styles: { 
            height: this.height
          , width: `200%` 
        }
    })

    this.elements.runButtonSection = this.createElement({
        tag: 'section'
      , classes: 'inlineCodeSuite-buttons inlineCodeSuite-run-buttons'
      , parent: this.elements.root
    })
  }
  
  createElement({ tag, classes, parent, styles = [] }) {
    let element = document.createElement(tag)
    element.className = classes
    parent.append(element)
    
    for (let key in styles) {
      element.style[key] = styles[key]
    }
    
    return element
  }
  
  stylesheets(editors) {
    let stylesheets = []
    
    let validStylesheets = ['css']
    editors.forEach( editor => {
      if( validStylesheets.includes( editor.rendered.getMode() ) ) { 
        stylesheets.push( editor.rendered.getValue() )
      }
    })
    
    return stylesheets
  }
  
  updateOutput(e) {
    if (this.preview) {
      this.preview.update({ 
          scripts: this.mergedScripts(this.editors, this.includeScripts)
        , stylesheets: this.stylesheets(this.editors)
        , content: this.content(this.editors) 
      })
    }
    this.runEditorScripts()
    this.console.scrollToBottom()
  }
}

module.exports = exports["default"]