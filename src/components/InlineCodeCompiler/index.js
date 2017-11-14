export default class InlineCodeCompiler {
  constructor({inlineCodeConsole, dispatchEvent, importScripts = [], mode = 'script'} = {},) {
    this.inlineCodeConsole = inlineCodeConsole
    this.dispatchEvent = dispatchEvent
    this.importScripts = importScripts.map( script => `${location.protocol}//${location.host}/${location.pathname}/${script}`)
    this.mode = mode
  }

  createContext(context = {}) {
    const baseContext = {
      console: {
        log: (msg) => { 
          if (this.mode == 'console') { throw msg }
          log.push(msg)
          return
        }
      },
      alert: function(msg) { 
        if (this.mode == 'console') { throw 'Grumpy cat says NO' }
        log.push(`Suppressed Alert: ${msg}`)
      },
      mode: this.mode
    }

    return Object.assign(baseContext, context)
  }

  createWorker() {
    const template = `
      let log = []
      const console = { 
        log: (...msgs) => { log.push(...msgs); return undefined },
        warn: (...msgs) => { log.push( ...msgs.map( msg => 'WARNING: ' + msg ) ); return undefined },
        error: (...msgs) => { log.push( ...msgs.map( msg => 'ERROR: ' + msg ) ); return undefined },
      }
      onmessage = (message) => {
        importScripts(...message.data.importScripts)
        const result = eval(message.data.code)
        postMessage( JSON.stringify( {result: result, log: log} ) )
      }
    `
    const blob = new Blob([template], {type: 'text/javascript'})
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)

    return worker
  }

  async runWorker() {

  }

  async compile({code, logOnly = false}) {
    this.dispatchEvent('compilerWillRun', { code: code, importScripts: this.importScripts, logOnly: logOnly })
    let output, log = [], success = false
    try {
      this.worker = this.createWorker()
      
      const compiledResult = await new Promise( (resolve, reject) => {
        const contextBlob = new Blob([this.context], {type: 'text/javascript'})
        this.worker.onmessage = message => resolve(message)
        this.worker.onerror = error => reject(error)
        this.worker.postMessage({code: code, importScripts: this.importScripts})
      })
      output = JSON.parse(compiledResult.data)
      output = (this.mode === 'script' ? output.log.join('\n') : '' ) + (logOnly ? '' : output.result)
      success = true
    } catch(e) {
      console.log('err', e)
      output = e.message
      success = false
    }
    return {
      output: output || (logOnly ? '' : 'undefined'),
      success: success
    }
  }
}