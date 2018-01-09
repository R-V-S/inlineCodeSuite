/**
 * Note: 
 *   - Although technically incorrect, in this preview's source doc, the script tags are placed after the closing body tag to 
 *     prevent them from appearing in the preview when an incomplete tag is added to the HTML editor tab.
 */

import './style.scss'

import testSuite from '!raw-loader!./../../assets/scripts/test-suite.js'

export default class InlineCodePreview {
  constructor({ root, scripts = [], stylesheets, content, height, settings, editorData, log }) {
    this.settings = settings
    this.scripts = scripts
    this.editorData = editorData
    this.log = log

    this.element = document.createElement('iframe')
    this.onDocumentLoad()
    this.element.classList.add('inline-code-preview')
    this.element.sandbox = 'allow-scripts allow-same-origin'
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts, editorData: editorData })
    this.element.style.height = this.height = height
    root.appendChild( this.element )
  }

  addScripts() {
    if (!this.scripts) { return }

    this.scripts.map( script => {
      const el = this.contentWindow.document.createElement('script')
      el.async = false
      el.type = script.type
      if (script.src) { el.src = script.src }
      el.text = `
        try {
          ${typeof script.value === 'function' ? `(${script.value.toString()})()` : script.value}
        } catch (e) {
            window.reportError(e)
        }`
      this.contentWindow.document.querySelector('script-area').appendChild(el)
    })
  }

  addTestingSuite() {
    this.scripts.unshift({
      type: 'text/javascript',
      value: testSuite
    })
  }

  onDocumentLoad() {
    this.element.onload = () => {
      this.contentWindow = this.element.contentWindow
      this.contentWindow.reportError = (e) => {
        console.log('(inline code editor) ', e)
        this.log(e)
      }
      
      this.contentWindow.inlineCodeSuite = { editorData: this.editorData }
      
      this.defineConsole()
      this.defineAlert()
      this.addTestingSuite()
      this.addScripts()
    }
  }

  defineConsole() {
    this.contentWindow.console = {
      log: (...msgs) => {
        console.log('(inline code editor log) ', ...msgs)
        this.log(msgs)
      }
    }
  }

  defineAlert() {
    this.contentWindow.alert = (...msgs) => {
      console.log('(inline code editor alert) ', ...msgs)
      this.log(`alert: ${msgs.join(' ')}`)
    }
  }
  
  generateSrcDoc({ content, stylesheets }) {
    return `
      <!doctype html>
      <html>
        <head>
          <title>Inline Code Suite</title>
          ${ stylesheets.map( stylesheet => `<style>${stylesheet}</style>`).join('\n') }
        </head>
        <body>
          ${ content }
        </body>
        
        <script-area></script-area>

      </html>`
  }

  setFullscreen(isEnabled) {
    if (isEnabled) {
      this.element.style.height = 'calc(100vh - 65px)'
    } else {
      this.element.style.height = this.height
    }
  }
  
  update({ scripts, stylesheets, content, editorData }) { 
    this.scripts = scripts || []
    this.editorData = editorData
    this.element.srcdoc = this.generateSrcDoc({ content, stylesheets })
  }
}