import testSuite from '!raw-loader!./../../assets/scripts/test-suite.js'
import consoleObject from '!raw-loader!./console.js'
import alertObject from '!raw-loader!./alert.js'
import documentObject from '!raw-loader!./document.js'
import onMessage from '!raw-loader!./on-message.js'

export default class InlineCodeCompiler {
  constructor({dispatchEvent, importScripts = [] }) {
    this.dispatchEvent = dispatchEvent
    this.importScripts = importScripts.map( script => `${location.protocol}//${location.host}/${location.pathname}/${script}`)
  }

  createWorker({ editorData = {}, mode }) {
    const template = `
      const inlineCodeSuite = {
        mode: '${mode}',
        editorData: ${JSON.stringify(editorData)}
      }
      
      let log = []

      ${consoleObject}
      ${alertObject}
      ${documentObject}
      ${testSuite}
      
      ${onMessage}
    `

    const blob = new Blob([template], {type: 'text/javascript'})
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)

    return worker
  }

  async compile({code, logOnly = false, editorData = {}, mode = 'script' }) {
    code = this.dispatchEvent('compilerWillRun', { code: code, importScripts: this.importScripts, logOnly: logOnly }) || code
    let outputString, outputData, log = [], success = false, danger = true
    try {
      const worker = this.createWorker({ editorData, mode })
      
      const compiledResult = await new Promise( (resolve, reject) => {
        let timeout
        const contextBlob = new Blob([this.context], {type: 'text/javascript'})
        worker.onmessage = message => { 
          // wait until eval begins before starting timeout so that import scripts have time to load
          if ( JSON.parse(message.data).type === 'starting eval' ) {
            timeout = setTimeout( () => {
              worker.terminate()
              reject({
                outputData: {
                  errorName: 'Internal Error',
                  result: 'Timed out. Possible infinite loop.'
                },
                success: false,
                danger: true,
                message: 'Timed out. Possible infinite loop.',
              })
            }, 100)
          } else {
            clearTimeout(timeout)
            resolve(message) 
          }
        }
        worker.onerror = error => { clearTimeout(timeout); reject(error) }
        worker.postMessage({code: code, importScripts: this.importScripts})
      })
      outputData = typeof compiledResult.data === 'string' ? JSON.parse(compiledResult.data) : compiledResult.data
      outputData = this.dispatchEvent('compilerDidRun', { code, importScripts: this.importScripts, logOnly, outputData }) || outputData
      success = outputData.success
      if (outputData.success ) {
        danger = false 
      } else if (outputData.errorName.match(/reference|syntax/i) ) {
        danger = true
      } 
      outputString = (mode === 'script' ? outputData.log.join('\n') : '' ) + (logOnly ? '' : outputData.result)
    } catch(e) {
      outputString = e.message
      outputData = e.outputData
      success = false
    }
    if (this.onReady) { 
      this.onReady()
      this.onReady = false
    }
    return {
      code,
      output: outputString || (logOnly ? '' : 'undefined'),
      outputData,
      success,
      danger
    }
  }
}