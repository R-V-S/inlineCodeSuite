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