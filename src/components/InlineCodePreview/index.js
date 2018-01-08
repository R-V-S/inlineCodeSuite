/**
 * Note: 
 *   - Although technically incorrect, in this preview's source doc, the script tags are placed after the closing body tag to 
 *     prevent them from appearing in the preview when an incomplete tag is added to the HTML editor tab.
 */

import './style.scss'

export default class InlineCodePreview {
  constructor({ root, scripts, stylesheets, content, height, settings, editorData, onError }) {
    this.settings = settings
    this.scripts = scripts
    this.editorData = editorData
    this.onError = onError

    this.element = document.createElement('iframe')
    this.addScripts()
    this.element.classList.add('inline-code-preview')
    this.element.sandbox = 'allow-scripts allow-same-origin'
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts, editorData: editorData })
    this.element.style.height = this.height = height
    root.appendChild( this.element )
  }

  addScripts() {
    this.element.onload = () => {
      const contentWindow = this.element.contentWindow
      contentWindow.reportError = (e) => {
        console.log('reporting error...', e)
        this.onError(e)
      }
      const blackHole = new Proxy(() => {}, { get: () => blackHole, apply: () => blackHole} )
      contentWindow.console = blackHole
      contentWindow.inlineCodeSuite = { editorData: this.editorData }
      
      this.scripts.map( script => {
        const el = contentWindow.document.createElement('script')
        el.async = false
        el.type = script.type
        if (script.src) { el.src = script.src }
        el.text = `
          try {
            ${typeof script.value === 'function' ? `(${script.value.toString()})()` : script.value}
          } catch (e) {
              window.reportError(e)
          }`
        contentWindow.document.querySelector('script-area').appendChild(el)
      })
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
    this.scripts = scripts 
    this.editorData = editorData
    this.element.srcdoc = this.generateSrcDoc({ content, stylesheets })
  }
}