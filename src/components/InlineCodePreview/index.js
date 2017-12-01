import './style.scss'

export default class InlineCodePreview {
  constructor({ root, scripts, stylesheets, content, height, settings }) {
    this.settings = settings

    this.element = document.createElement('iframe')
    this.element.classList.add('inline-code-preview')
    this.element.sandbox = 'allow-scripts'
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts })
    this.element.style.height = height
    root.append( this.element )
  }
  
  generateSrcDoc({ content, stylesheets, scripts }) {
    return `
      <!doctype html>
      <html>
        <head>
          <title>Inline Code Suite</title>
          ${ stylesheets.map( stylesheet => `<style>${stylesheet}</style>`).join('\n') }
        </head>
        <body>
          ${ content }
          <script>//var console = { log: () => {} }</script>
          ${ scripts.map( script => 
            `<script type="${script.type}" ${script.src ? `src="${script.src}"` : ''}>
              ${typeof script.value === 'function' ? `(${script.value.toString()})()` : script.value}
            </script>` )
          .join('\n') }
        </body>
      </html>`
  }
  
  update({ scripts, stylesheets, content }) { 
    this.element.srcdoc = this.generateSrcDoc({ content: content, stylesheets: stylesheets, scripts: scripts })
  }
}