import './style.scss'

import InlineCodeEditor from './components/InlineCodeEditor'
import InlineCodePreview from './components/InlineCodePreview'
import InlineCodeConsole from './components/InlineCodeConsole'
import InlineCodeCompiler from './components/InlineCodeCompiler'

export default class InlineCodeSuite {
  constructor ({ root, editors, scripts, hasConsole = true, preview, autoRun = true, autoPreview = true, useLocalStorage = true, enableFullscreen = false, recording = false, name, height = '300px', importScripts }) {
    if (!root) { throw new Error('Root Element not found') }
    this.includeScripts = scripts ? scripts.filter( script => !script.runButton ) : []
    this.runScripts = scripts ? scripts.filter( script => script.runButton ) : []
    this.importScripts = importScripts

    this.settings = { 
      autoRun,
      autoPreview,
      enableFullscreen,
      recording,
      hasConsole,
      height: Number.isInteger(height) ? `${height}px` : height,
      name,
      preview,
      slug: name ? `inlineCodeSuite-${this.slugify(name)}` : '',
      useLocalStorage
    }

    this.editors = editors

    this.eventHandlers = {
      suiteInitialized: null,
      compilerWillRun: null,
      compilerDidRun: null,
      previewWillUpdate: null,
      previewDidUpdate: null
    }
    
    this.scaffoldElements({ root: root, editorCount: this.editors.length })
    this.addDependencies()
    
    this.runScripts.forEach( script => this.createScriptRunButton({ script: script }) )
    
    // get stored editor data
    if (this.settings.useLocalStorage && this.settings.slug && localStorage) {
      this.storedEditorData = JSON.parse(localStorage.getItem(this.settings.slug))
      this.createRefreshButton()
    }

    if (this.settings.enableFullscreen) {
      this.createFullscreenButton()
    }

    // create editors
    for (let index in this.editors) {
      // grab stored editor data, if it exists, for this particular editor. Default storedEditor to an empty object so that we can
      // attempt to access properties to it without error (also it's type consistent).
      const editor = this.editors[index]
      const storedEditor = this.storedEditorData ? this.storedEditorData[ editor.name ] : {}
      this.renderEditor({ editor, index, storedEditor })
    }
    
    this.activeId = this.editors[0].id
    this.activeFocusButton().classList.add('active')

    this.compiler = new InlineCodeCompiler({ 
      dispatchEvent: (...params) => this.dispatchEvent(...params),
      inlineCodeConsole: this.console, 
      importScripts: this.importScripts
    })
    if (this.settings.hasConsole) {
      this.createConsole()
    }
    
    this.createPreview()
    
    this.createOutputButtons()

    if (!this.preview && this.settings.hasConsole) { this.showConsole() }
    
    this.updateOutput()
  }

  addDependencies() {
    const iconLink = document.createElement('link')
    iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
    iconLink.rel = 'stylesheet'
    iconLink.onload = () => {
      this.elements.root.classList.add('icons-loaded')
    }
    this.elements.root.appendChild(iconLink)
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
    if (this.settings.hasConsole) {
      this.consoleButton = document.createElement('button')
      this.consoleButton.textContent = 'Console'
      this.elements.outputButtonSection.appendChild(this.consoleButton)
      
      this.consoleButton.onclick = e => {
        this.showConsole()
      }
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

  async createPreview() {
    // let mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
    // const dryRun = await this.dryRun(mergedScripts)
    // if (!dryRun.success) { mergedScripts = {} }

    if ( !this.content(this.editors) ) { return }
    this.preview = new InlineCodePreview({ 
      content: this.content(this.editors), 
      editorData: this.getEditorData(),
      height: this.settings.height, 
      root: this.elements.outputScroller, 
      stylesheets: this.stylesheets(this.editors), 
      settings: this.settings.preview,
      log: (e) => {
        if (this.console) {
          this.console.appendOutput(e)
        }
      }
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

  async createConsole() {
    this.console = new InlineCodeConsole({
      height: this.settings.height,
      root: this.elements.outputScroller,
      compiler: this.compiler,
      compile: async ({code}) => {
        return this.compiler.compile({
          code,
          mode: 'console',
          forceReturn: true,
          editorData: this.getEditorData()
        })
      }
    })
  }
  
  createEditorRunButton({ editor }) {
    let button = document.createElement('button')
    button.textContent = editor.runButton || 'RUN'
    button.dataset.id = editor.id
    this.elements.runButtonSection.appendChild(button)
    
    button.onclick = e => {
      let mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
      let mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '') + editor.rendered.getValue()
      if (this.preview) {
        this.updatePreview({ value: editor.rendered.getValue(), type: `text/${editor.mode}` })
        if (this.settings.hasConsole) { this.showConsole() }
      } else {
        this.runScript({ script: mergedScript })
      }
    }
    
    this.elements.buttons.focus.push(button)
  }

  createScriptRunButton({ script }) {
    let button = document.createElement('button')
    button.textContent = script.runButton
    this.elements.runButtonSection.appendChild(button)
    
    button.onclick = e => {
      if (script.value) {
        let mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
        let mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '') + script.value
        this.runScript({ script: mergedScript })
      }
      if (script.onRun && typeof script.onRun === 'function') {
        script.onRun({ editorData: this.getEditorData() })
      }
    }
    
    this.elements.buttons.focus.push(button)
  }

  createFullscreenButton() {
    let button = document.createElement('button')
    button.innerHTML = '<i class="material-icons">fullscreen</i>'
    button.title = 'Toggle fullscreen mode'
    this.elements.operationButtonSection.appendChild(button)

    button.onclick = e => {
      this.settings.inFullscreenMode = this.settings.inFullscreenMode ? false : true
      this.elements.root.classList.toggle('fullscreen')
      if (this.settings.inFullscreenMode == true) {
        this.editors.forEach( editor => editor.rendered.setFullscreen(true) )
        this.preview.setFullscreen(true)
        this.console.setFullscreen(true)
        this.elements.editorScroller.style['height'] = this.elements.outputScroller.style['height'] = 'calc(100vh - 65px)'
        button.innerHTML = '<i class="material-icons">fullscreen_exit</i>'
      } else {
        this.editors.forEach( editor => editor.rendered.setFullscreen(false) )
        this.preview.setFullscreen(false)
        this.console.setFullscreen(false)
        this.elements.editorScroller.style['height'] = this.elements.outputScroller.style['height'] = this.settings.height
        button.innerHTML = '<i class="material-icons">fullscreen</i>'
      }
    }
  }

  createRefreshButton() {
    let button = document.createElement('button')
    button.innerHTML = '<i class="material-icons">refresh</i>'
    button.title = 'Reset editor content to default'
    this.elements.operationButtonSection.appendChild(button)

    button.onclick = e => {
      this.editors.forEach( editor => editor.rendered.reset() )
    }
  }

  /**
   * @method renderEditor
   * @param {editor} a raw editor initialization object
   * @param {index} the index in the array of editors, so that its button can reference this editor's position
   * @param {storedEditor}
   * @returns undefined
   */
  renderEditor({ editor, index, storedEditor = {} }) {
    const validModes = ['css', 'htmlmixed', 'javascript', 'jsx', 'ruby', 'xml']
    if ( !validModes.includes(editor.mode) ) { throw new Error(`"${editor.mode}" is an invalid editor mode`)}

    editor.id = this.id()

    // Format the raw editor's value by removing any extraneous indentation
    const formattedValue = editor.preserveBaseIndentation ? editor.value : this.stripIndentation(editor.value)
    
    this.createFocusButton({ editor: editor, index: index })
    if (editor.runButton) { this.createEditorRunButton({ editor: editor }) }
    
    editor.rendered = new InlineCodeEditor({ 
      root: this.elements.editorScroller, 
      mode: editor.mode, 
      name: editor.name, 
      id: editor.id, 
      height: this.settings.height, 
      readOnly: editor.readOnly || false,
      theme: editor.theme, 
      value: formattedValue, 
      userValue: storedEditor.userValue || formattedValue,
      onChange: e => { 
        if (this.settings.autoRun) { this.updateOutput(e) } 
        else if (this.settings.autoPreview && editor.mode.match(/^(html|css)/i) ) { this.updatePreview() }
        if (this.settings.useLocalStorage && localStorage) { localStorage.setItem(this.settings.slug, JSON.stringify(this.getEditorData()) ) }
      }
    })
    
    editor.rendered.element.style.width = `${100 / this.editors.length}%`
  }

  async runScript({ script, clear = true, showConsole = true, showErrors = true, silentOutput = false }) {
    let compiled = await this.compiler.compile({
      code: script,
      logOnly: true,
      editorData: this.getEditorData()
    })

    if (clear) { this.console.clear({ starterScript: compiled.success ? script : '' }) }
    if (!silentOutput && (showErrors || compiled.success == true) ) {
      this.console.appendOutput( compiled.output )
    }
    if (silentOutput && showErrors && !compiled.success) {
      console.log(compiled)
      this.console.appendOutput( `${compiled.outputData.errorName}:  ${compiled.outputData.result}` )
    }
    if (showConsole && this.settings.hasConsole) { this.showConsole() }

    return compiled
  }

  async runEditorScripts() {
    let validScriptTypes = ['javascript']
    let output = false
    await this.editors.forEach( async editor => {
      if( validScriptTypes.includes( editor.rendered.getMode() ) && editor.hasPreview !== false ) { 
        output = await this.runScript({ script: editor.rendered.getValue(), clear: false, showConsole: false, showErrors: true })
      }
    })
    return output
  }

  stripIndentation(text) {
    if (!text) { return }
    const indentCount = Math.min( ...text.split('\n').map( line => line.match(/\S/) ? line.match(/(^\s*)(?=\S)/)[0].length : 100 ) )
    return text.split('\n').map( line => line.substr(indentCount) ).join('\n').trim()
  }

  getEditorData() {
    const editorData = {}
    this.editors.forEach( editor => {
      editorData[editor.name] = Object.assign({}, editor, {
        userValue: editor.rendered.getValue(), 
        history: editor.rendered.getHistory() 
      })
      delete editorData[editor.name].rendered
    })
    return editorData
  }
  
  setEditorContent({ name, content = '', preserveBaseIndentation, clearHistory = true }) {
    const editor = this.editors.find( editor => name === editor.name)
    if (!editor) { return }
    // strip indentation, unless told otherwise. Allow this function's setting to override the editor's setting.
    const reallyPreserveIndentation = preserveBaseIndentation ? true : (editor.preserveBaseIndentation || false)
    const formattedContent = reallyPreserveIndentation ? content : this.stripIndentation(content)
    editor.rendered.reset({ value: formattedContent, clearHistory })
  }

  setPreviewSettings(preview) {
    this.settings.preview = preview
    this.updatePreview()
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
    if (this.settings.name) { this.elements.root.setAttribute('id', this.settings.slug) }
    root.appendChild( this.elements.root )
    
    this.elements.buttons = {}
    this.elements.buttons.run = []
    this.elements.buttons.focus = []
    
    // the button section is for general purpose buttons (like the run button), and user-defined buttons.
    this.elements.buttonSection = this.createElement({ 
        tag: 'section', 
        classes: 'inlineCodeSuite-buttons', 
        parent: this.elements.root
    })

    // focus buttons are tab buttons that will display a specific editor. they go in the top left.
    this.elements.focusButtonSection = this.createElement({ 
        tag: 'section', 
        classes: 'inlineCodeSuite-focus-buttons', 
        parent: this.elements.buttonSection
    })

    // create output button section for console, preview. they go in the top right.
    this.elements.outputButtonSection = this.createElement({ 
        tag: 'section', 
        classes: 'inlineCodeSuite-output-buttons', 
        parent: this.elements.buttonSection
    })
    
    // create a container for the editors
    this.elements.editorSection = this.createElement({
        tag: 'section', 
        classes: 'inlineCodeSuite-editors', 
        parent: this.elements.root
    })
    
    this.elements.editorScroller = this.createElement({
        tag: 'div', 
        classes: 'inlineCodeSuite-editor-scroller', 
        parent: this.elements.editorSection, 
        styles: {
          height: this.settings.height, 
          width: `${100 * editorCount}%`
        }
    })

    this.elements.outputSection = this.createElement({
        tag: 'section', 
        classes: 'inlineCodeSuite-output', 
        parent: this.elements.root
    })
    
    this.elements.outputScroller = this.createElement({
        tag: 'section', 
        classes: 'inlineCodeSuite-output-scroller', 
        parent: this.elements.outputSection, 
        styles: { 
            height: this.settings.height, 
            width: `200%` 
        }
    })

    this.elements.runButtonSection = this.createElement({
        tag: 'section', 
        classes: 'inlineCodeSuite-buttons inlineCodeSuite-run-buttons', 
        parent: this.elements.root
    })

    // the operation button section is for subtle, special purpose operations like "refresh". they go in the bottom left.
    this.elements.operationButtonSection = this.createElement({ 
      tag: 'section', 
      classes: 'inlineCodeSuite-operation-buttons', 
      parent: this.elements.runButtonSection
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

  async dryRun(mergedScripts) {
    const mergedScript = mergedScripts.reduce( (all, script) => all += script.value + '\n', '')
    const outputTest = await this.runScript({ script: mergedScript, showConsole: false, silentOutput: true, showErrors: true })
    if (outputTest.danger) { return {success: false} }
    return {success: true}
  }

  async updatePreview(script) {
    const mergedScripts = this.mergedScripts(this.editors, this.includeScripts)
    if (script) { mergedScripts.push(script) }
    if (mergedScripts.length) { 
      const dryRun = await this.dryRun(mergedScripts)
      if (!dryRun.success) { return false }
    }
    
    this.preview.update({ 
      scripts: mergedScripts, 
      stylesheets: this.stylesheets(this.editors), 
      content: this.content(this.editors),
      editorData: this.getEditorData()
    })
  }
  
  async updateOutput(e) {
    if (this.preview) {
      this.updatePreview()
    } else {
      this.runEditorScripts()
    }
    this.console.scrollToBottom()
  }
}

try {
  module.exports = exports["default"]
} catch(e) {}