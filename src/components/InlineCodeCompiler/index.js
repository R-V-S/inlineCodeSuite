export default class InlineCodeCompiler {
  constructor({inlineCodeConsole, dispatchEvent, importScripts = [], mode = 'script'} = {},) {
    this.inlineCodeConsole = inlineCodeConsole
    this.dispatchEvent = dispatchEvent
    this.importScripts = importScripts.map( script => `${location.protocol}//${location.host}/${location.pathname}/${script}`)
    this.mode = mode
  }

  createWorker({ editorData }) {
    const template = `
      const inlineCodeSuite = {
        mode: '${this.mode}',
        editorData: ${JSON.stringify(editorData)}
      }
      let log = []
      const console = { 
        log: (...msgs) => { log.push(...msgs); return undefined },
        warn: (...msgs) => { log.push( ...msgs.map( msg => 'WARNING: ' + msg ) ); return undefined },
        error: (...msgs) => { log.push( ...msgs.map( msg => 'ERROR: ' + msg ) ); return undefined },
      }
      const alert = msg => { 
        log.push( 'Grumpy cat says NO to alerts' )
        if (inlineCodeSuite.mode === 'console') { throw 'Grumpy cat says NO to alerts!' }
      }
      onmessage = (message) => {
        importScripts(...message.data.importScripts)
        let result
        try { 
          postMessage( JSON.stringify( {type: 'starting eval'} ) )
          result = eval(message.data.code) 
          postMessage( JSON.stringify( {type: 'result', result: result, success: true, log: log} ) )
        } catch (e) {
          log.push(e.message)
          postMessage( JSON.stringify( {type: 'result', result: e.message, success: false, log: log, errorName: e.name} ) )
        }
        close()
      }
    `
    const blob = new Blob([template], {type: 'text/javascript'})
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)

    return worker
  }

  async compile({code, logOnly = false, editorData}) {
    code = this.dispatchEvent('compilerWillRun', { code: code, importScripts: this.importScripts, logOnly: logOnly }) || code
    let outputString, log = [], success = false, danger = true
    try {
      const worker = this.createWorker({ editorData: editorData })
      
      const compiledResult = await new Promise( (resolve, reject) => {
        let timeout
        const contextBlob = new Blob([this.context], {type: 'text/javascript'})
        worker.onmessage = message => { 
          // wait until eval begins before starting timeout so that import scripts have time to load
          if ( JSON.parse(message.data).type === 'starting eval' ) {
            timeout = setTimeout( () => {
              worker.terminate()
              reject({
                success: false,
                danger: true,
                message: 'Timed out. Possible infinite loop.'
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
      let outputData = typeof compiledResult.data === 'string' ? JSON.parse(compiledResult.data) : compiledResult.data
      outputData = this.dispatchEvent('compilerDidRun', { code: code, importScripts: this.importScripts, logOnly: logOnly }) || outputData
      success = outputData.success
      if (outputData.success) {
        danger = false 
      } else if( outputData.errorName.match(/reference|syntax/i) ) {
        danger = true
      } 
      outputString = (this.mode === 'script' ? outputData.log.join('\n') : '' ) + (logOnly ? '' : outputData.result)
    } catch(e) {
      outputString = e.message
      success = false
    }
    if (this.onReady) { 
      this.onReady()
      this.onReady = false
    }
    return {
      output: outputString || (logOnly ? '' : 'undefined'),
      success: success,
      danger: danger
    }
  }
}