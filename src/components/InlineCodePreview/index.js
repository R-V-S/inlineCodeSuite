/**
 * Note: 
 *   - Although technically incorrect, in this preview's source doc, the script tags are placed after the closing body tag to 
 *     prevent them from appearing in the preview when an incomplete tag is added to the HTML editor tab.
 */

import './style.scss'

export default class InlineCodePreview {
  constructor({ root, scripts, stylesheets, content, height, settings, editorData }) {
    this.settings = settings

    this.element = document.createElement('iframe')
    this.element.classList.add('inline-code-preview')
    this.element.sandbox = 'allow-scripts'
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts, editorData: editorData })
    this.element.style.height = height
    root.appendChild( this.element )
  }
  
  generateSrcDoc({ content, stylesheets, scripts, editorData }) {
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

        <script>
          const console = { log: () => {} }; 
          const inlineCodeSuite = { editorData: ${JSON.stringify(editorData)} };
        </script>
        
        ${ scripts.map( script => 
          `<script type="${script.type}" ${script.src ? `src="${script.src}"` : ''}>
            ${typeof script.value === 'function' ? `(${script.value.toString()})()` : script.value}
          </script>` )
          .join('\n') }

      </html>`
  }
  
  update({ scripts, stylesheets, content, editorData }) { 
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts, editorData: editorData })
  }
}