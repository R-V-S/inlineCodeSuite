export default class InlineCodeCompiler {
  constructor({console} = {}) {
    this.console = console
  }

  compile({code, mode = 'script', logOnly = false}) {
    let output, log = '', success = false
    try {
      const console = {
        log: (msg) => { 
          if (mode == 'console') { throw msg }
          log += `${msg}\n`
          return
        }
      }
      const alert = function(msg) { 
        if (mode == 'console') { throw 'Grumpy cat says NO' }
        log += `ALERT: ${msg}\n`
      }
      output = eval(code)
      output = log + (logOnly ? '' : output)
      success = true
    } catch(e) {
      output = e
      success = false
    }
    return {
      output: output || (logOnly ? '' : 'undefined'),
      success: success
    }
  }
}