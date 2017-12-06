import './style.scss'

import InlineCodeEditor from './components/InlineCodeEditor'
import InlineCodePreview from './components/InlineCodePreview'
import InlineCodeConsole from './components/InlineCodeConsole'
import InlineCodeCompiler from './components/InlineCodeCompiler'

export default class InlineCodeSuite {
  constructor ({ root, editors, scripts, preview, autoRun = true, name, height = '300px', importScripts }) {
    if (!root) { throw new Error('Root Element not found') }
    this.includeScripts = scripts ? scripts.filter( script => !script.runButton ) : []
    this.runScripts = scripts ? scripts.filter( script => script.runButton ) : []
    this.importScripts = importScripts

    // TODO: consolidate all settings into this.settings object (currently only used by preview setting to avoid conflict with this.preview object)
    this.settings = { preview: preview }
    this.autoRun = autoRun
    this.name = name
    this.editors = editors

    this.eventHandlers = {
      suiteInitialized: null,
      compilerWillRun: null,
      compilerDidRun: null,
      previewWillUpdate: null,
      previewDidUpdate: null
    }
    
    this.height = Number.isInteger(height) ? `${height}px` : height
    
    this.scaffoldElements({ root: root, editorCount: this.editors.length })
    
    this.runScripts.forEach( script => this.createScriptRunButton({ script: script }) )
    
    // create editors
    for (let i in this.editors) {
      this.renderEditor({ editor: this.editors[i], index: i })
    }
    
    this.activeId = this.editors[0].id
    this.activeFocusButton().classList.add('active')
    
    this.inlineCodeConsole = new InlineCodeConsole({
      dispatchEvent: (...params) => this.dispatchEvent(...params),
      height: this.height,
      root: this.elements.outputScroller
    })

    this.compiler = new InlineCodeCompiler({ 
      dispatchEvent: (...params) => this.dispatchEvent(...params),
      inlineCodeConsole: this.inlineCodeConsole, 
      importScripts: this.importScripts
    })
    
    this.createPreview()
    
    this.createOutputButtons()

    if (!this.preview) { this.showConsole() }
    
    this.updateOutput()
  }

  addEventListener(type, callback) {
    if ( !this.eventHandlers.hasOwnProperty(type) || typeof callback !== 'function') { return }
    this.eventHandlers[type] = callback
  }
  
  activeFocusButton() {
    return this.elements.buttons.focus.find( b => b.dataset.id === this.activeId)
  }
  
  mergedScripts(editors, scripts) {
    const result = Array.from(scripts)
    let validScriptTypes = ['javascript']
    editors.forEach( editor => {
      if( validScriptTypes.includes( editor.rendered.getMode() ) && editor.hasPreview !== false ) { 
        result.push({ type: 'text/javascript', value: editor.rendered.getValue() })
      }
    })
    
    return result
  }
  
  content(editors) {
    let htmleditor = editors.find( editor => this.isHtml(editor) )
    
    let content = htmleditor ? htmleditor.rendered.getValue() : ''
    try { content = (this.settings.preview.html.pre || '') + content } catch(e) {}
    try { content += this.settings.preview.html.post || '' } catch(e) {}
    return content
  }
  
  createFocusButton({ editor, index }) {
    let button = document.createElement('button')
    button.textContent = editor.name || editor.mode
    button.dataset.id = editor.id
    this.elements.focusButtonSection.appendChild(button)
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
    this.elements.outputButtonSection.appendChild(this.consoleButton)
    
    this.consoleButton.onclick = e => {
      this.showConsole()
    }

    if (!this.preview) { return }
    this.previewButton = document.createElement('button')
    this.previewButton.textContent = 'Preview'
    this.previewButton.classList.add('active')
    this.elements.outputButtonSection.appendChild(this.previewButton)

    this.previewButton.onclick = e => {
      this.showPreview()
    }
  }

  createPreview() {
    if ( !this.content(this.editors) ) { return }
    this.preview = new InlineCodePreview({ 
      content: this.content(this.editors), 
      height: this.height, 
      root: this.elements.outputScroller, 
      scripts: this.mergedScripts(this.editors, this.includeScripts), 
      stylesheets: this.stylesheets(this.editors), 
      settings: this.settings.preview
    })
  }

  dispatchEvent(type, data) {
    if ( !this.eventHandlers.hasOwnProperty(type) || typeof this.eventHandlers[type] !== 'function') { return }
    this.eventHandlers[type](data)
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
    this.elements.runButtonSection.appendChild(button)
    
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
    this.elements.runButtonSection.appendChild(button)
    
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
      root: this.elements.editorScroller, 
      mode: editor.mode, 
      name: editor.name, 
      id: editor.id , 
      height: this.height, 
      readOnly: editor.readOnly || false,
      theme: editor.theme, 
      value: editor.preserveBaseIndentation ? editor.value : this.stripIndentation(editor.value), 
      onChange: e => { if (this.autoRun) { this.updateOutput(e) } }
    })
    
    editor.rendered.element.style.width = `${100 / this.editors.length}%`
  }

  async runScript({ script: script, clear = true, showConsole = true, showErrors = true }) {
    let compiled = await this.compiler.compile({
      code: script,
      logOnly: true,
      editorData: this.getEditorData()
    })
    if (clear) { this.inlineCodeConsole.clear() }
    if (showErrors || compiled.success == true) {
      this.inlineCodeConsole.appendOutput( compiled.output )
    }
    if (showConsole) { this.showConsole() }

    return compiled
  }

  async runEditorScripts() {
    let validScriptTypes = ['javascript']
    let output = false
    await this.editors.forEach( async editor => {
      if( validScriptTypes.includes( editor.rendered.getMode() ) && editor.hasPreview !== false ) { 
        output = await this.runScript({ script: editor.rendered.getValue(), clear: false, showConsole: false, showErrors: false })
      }
    })
    return output
  }

  stripIndentation(text) {
    if (!text) { return }
    const indentCount = Math.min( ...text.split('\n').map( line => line.match(/\S/) ? line.match(/(^\s*)(?=\S)/)[0].length : 100 ) )
    return text.split('\n').map( line => line.substr(indentCount) ).join('\n')
  }

  getEditorData() {
    const editors = {}
    this.editors.forEach( editor => {
      editors[editor.name] = Object.assign({}, editor, {userValue: editor.rendered.getValue(), rendered: null })
    })
    return editors
  }
  
  id() {
    return Math.random().toString(36).substr(2)
  }
  
  isHtml(editor) {
    return /^html/.test( editor.rendered.getMode() )
  }

  slugify(string) {
    return string.toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
      .replace(/[\s_-]+/g, '-') // swap any length of whitespace, underscore, hyphen characters with a single -
      .replace(/^-+|-+$/g, ''); // remove leading, trailing -
  }
  
  scaffoldElements({ root, editorCount }) {
    this.elements = {}
    this.elements.root = document.createElement('section')
    this.elements.root.classList.add('inlineCodeSuite')
    if (this.name) { this.elements.root.setAttribute('id', `inlineCodeSuite-${this.slugify(this.name)}`) }
    root.appendChild( this.elements.root )
    
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
    parent.appendChild(element)
    
    for (let key in styles) {
      element.style[key] = styles[key]
    }
    
    return element
  }
  
  stylesheets(editors) {
    let stylesheets = []
    
    let validStylesheets = ['css'] // could be expanded to scss, less, etc in the future
    // add styles from editors
    editors.forEach( editor => {
      if( validStylesheets.includes( editor.rendered.getMode() ) ) { 
        stylesheets.push( editor.rendered.getValue() )
      }
    })
    // add style string from preview settings
    try { stylesheets.push(this.settings.preview.styles) } catch(e) {}
    
    return stylesheets
  }

  async updatePreview() {
    const mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
    if (!mergedScripts.length) { return false }

    const mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '')
    const outputTest = await this.runScript({ script: mergedScript, showConsole: false })
    if (outputTest.danger) { return false }

    this.preview.update({ 
      scripts: mergedScripts, 
      stylesheets: this.stylesheets(this.editors), 
      content: this.content(this.editors),
      editorData: this.getEditorData()
    })
  }
  
  async updateOutput(e) {
    this.runEditorScripts()
    if (this.preview) {
      this.updatePreview()
    }
    this.inlineCodeConsole.scrollToBottom()
  }
}

if (typeof exports !== undefined) {
  module.exports = exports["default"]
}