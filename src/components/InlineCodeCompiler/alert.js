const alert = (...msgs) => { 
  log.push( `alert: ${msgs.join(' ')}` )
  return inlineCodeSuite.mode === 'console' ? "Sorry, alerts are not allowed in the console" : undefined
}