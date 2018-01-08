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
      const console = { 
        log: (...msgs) => { log.push(...msgs); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console. No' : undefined },
        warn: (...msgs) => { log.push( ...msgs.map( msg => 'WARNING: ' + msg ) ); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console. No' : undefined },
        error: (...msgs) => { log.push( ...msgs.map( msg => 'ERROR: ' + msg ) ); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console. No' : undefined },
      }
      
      const alert = msg => { 
        log.push( "Sorry, alerts are not allowed" )
        if (inlineCodeSuite.mode === 'console') { throw { message: "Sorry, alerts are not allowed!", name: 'internal error'} }
      }
      
      // black hole
      const document = new Proxy(() => {}, { get: () => document, apply: () => document })
      
      const ICS_Spec = {
        reset: function() {
          this.counts = {
            run: 0,
            passed: 0,
            failed: 0
          }
          this.passed = false  
          this.run = true
        }
      }
      
      describe = (describeDescription, specDefinitions) => {
        ICS_Spec.reset()
        if (!describeDescription || !specDefinitions) { return }
        console.log(\`Testing \${describeDescription.toLowerCase()}...\n\`)
        
        
        specDefinitions()
        if (ICS_Spec.counts.run && ICS_Spec.counts.failed === 0) { 
          console.log("HUZZAH!!!")
          ICS_Spec.passed = true
        }
        ICS_Spec.description = describeDescription
        delete(ICS_Spec.itDescription)
        console.log(\`\n\${ICS_Spec.counts.run} tests run. \${ICS_Spec.counts.passed} passed. \${ICS_Spec.counts.failed} failed.\`)
      }
      
      it = (itDescription, testFunction) => {
        ICS_Spec.itDescription = itDescription
        testFunction.apply(this)
      }
      
      expect = (result) => {
        const matchers = {
          toBe: (real) => result === real,
          toBeCloseTo: (expected, precision) => expected == Math.round(result*Math.pow(10,2))/Math.pow(10,2),
          toBeDefined: () => result !== undefined,
          toBeFalsy: () => result == false,
          toBeGreaterThan: (expected) => result > expected,
          toBeGreaterThanOrEqual: (expected) => result >= expected,
          toBeLessThan: (expected) => result < expected, 
          toBeLessThanOrEqual: (expected) => result <= expected,
          toBeNaN: () => Number.isNaN(result),
          toBeNegativeInfinity: () => result === -Infinity,
          toBeNull: () => result === null,
          toBePositiveInfinity: () => result === Infinity,
          toBeTruthy: () => result == true,
          toBeUndefined: () => result === undefined,
          toEqual: (expected) => result == expected, // NOTE: Should do deep comparison
          toMatch: (expected) => result.match(expected) ? true : false
        }
        const proxies = {}
        for (let key in matchers ) {
          // console.log(matchers[key])
          proxies[key] = new Proxy(matchers[key], {
            apply: (target, thisArg, argumentsList) => {
              let exp = null
              ICS_Spec.counts.run++
              try { 
                exp = target.apply(this, argumentsList)
                if (exp) {
                  ICS_Spec.counts.passed++
                  // console.log('  -PASSED: ' + ICS_Spec.itDescription + '-')
                } else {
                  ICS_Spec.counts.failed++
                  console.log('  FAILED: ' + ICS_Spec.itDescription)
                  console.log(\`    expected \${argumentsList}, got \${result} \`)
                }
              } catch(e) {
                exp = e
                ICS_Specs.counts.failed++
              }
              return exp
            }
          })
        }
        return proxies
      }
      
      onmessage = (message) => {
        importScripts(...message.data.importScripts)
        let result
        try { 
          postMessage( JSON.stringify( {type: 'starting eval'} ) )
          result = eval(message.data.code) 
          postMessage( JSON.stringify( {type: 'result', result: result, success: true, log: log, spec: ICS_Spec} ) )
        } catch (e) {
          log.push(e.name+': '+e.message)
          postMessage( JSON.stringify( {type: 'result', result: e.message, success: false, log: log, errorName: e.name, spec: ICS_Spec} ) )
        }
        close()
      }
    `
    const blob = new Blob([template], {type: 'text/javascript'})
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)

    return worker
  }

  async compile({code, logOnly = false, editorData = {}, mode = 'script' }) {
    code = this.dispatchEvent('compilerWillRun', { code: code, importScripts: this.importScripts, logOnly: logOnly }) || code
    let outputString, log = [], success = false, danger = true
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
      let outputData = typeof compiledResult.data === 'string' ? JSON.parse(compiledResult.data) : compiledResult.data
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
      success = false
    }
    if (this.onReady) { 
      this.onReady()
      this.onReady = false
    }
    return {
      code,
      output: outputString || (logOnly ? '' : 'undefined'),
      success,
      danger
    }
  }
}