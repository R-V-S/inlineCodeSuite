const console = { 
  log: (...msgs) => { log.push(...msgs); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console.' : undefined },
  warn: (...msgs) => { log.push( ...msgs.map( msg => 'WARNING: ' + msg ) ); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console.' : undefined },
  error: (...msgs) => { log.push( ...msgs.map( msg => 'ERROR: ' + msg ) ); return inlineCodeSuite.mode === 'console' ? 'Sorry, the console does not log to the console.' : undefined },
}