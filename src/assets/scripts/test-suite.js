const ICS_Spec = {
  reset: function() {
    this.counts = {
      run: 0,
      passed: 0,
      failed: 0,
      pending: 0
    }
    this.passed = false  
    this.run = true
    this.beforeEachCallback = null
    this.afterEachCallback = null
    this.itDescription = null
    this.itPasses = null
    this.terminateEarly = false
  }
}

describe = (describeDescription, specDefinitions) => {
  ICS_Spec.reset()
  if (!describeDescription || !specDefinitions) { return }
  console.log(`Testing ${describeDescription.toLowerCase()}................ \n`)
  
  try {
    specDefinitions()
  } catch (e) {
    console.log('Encountered error will trying to run tests. \n')
    console.log(e)
  }
  if (ICS_Spec.counts.run && ICS_Spec.counts.failed === 0) { 
    console.log("HUZZAH!!!")
    ICS_Spec.passed = true
  }
  ICS_Spec.description = describeDescription
  delete(ICS_Spec.itDescription)
  console.log(` \n${ICS_Spec.counts.run} tests run. ${ICS_Spec.counts.passed} passed. ${ICS_Spec.counts.failed} failed. ${ICS_Spec.counts.pending} pending.\n`)
}

xdescribe = () => {}

beforeEach = (callback) => {
  ICS_Spec.beforeEachCallback = callback
}

afterEach = (callback) => {
  ICS_Spec.afterEachCallback = callback
}

it = (itDescription, testFunction) => {
  if (ICS_Spec.terminateEarly) { return }
  ICS_Spec.itDescription = itDescription
  ICS_Spec.itPasses = true
  ICS_Spec.counts.run++
  const terminateEarly = (e) => {
    ICS_Spec.terminateEarly = true
    console.log(e.message)
    ICS_Spec.counts.failed++
  }
  try {
    const itThis = {}
    try {
      if (ICS_Spec.beforeEachCallback) { ICS_Spec.beforeEachCallback.apply(itThis) }
    } catch (e) {
      console.log(`Terminating early because of error(s) in beforeEach. \n`)  
      terminateEarly(e)
      return
    }
    testFunction.apply(itThis)
    try {
      if (ICS_Spec.afterEachCallback) { ICS_Spec.afterEachCallback.apply(itThis) }
    } catch (e) {
      console.log(`Terminating early because of error(s) in afterEach. \n`)  
      terminateEarly(e)
      return
    }
    ICS_Spec.itPasses ? ICS_Spec.counts.passed++ : ICS_Spec.counts.failed++
  } catch (e) {
    console.log(`Encountered error(s) while trying to run test: ${ICS_Spec.itDescription} \n`)
    console.log(e.message)
    console.log('')
    ICS_Spec.counts.failed++
  }
}

xit = (itDescription) => {
  ICS_Spec.counts.pending++
}

expect = (result) => {
  const matchers = {
    toBe: (real) => { return {
      test: () => result === real, 
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be "${real}", got "${result}" instead` 
    }},
    toBeCloseTo: (expected, precision) => { return {
      test: () => { var rounded = Math.round(result*Math.pow(10,precision))/Math.pow(10,precision); return expected == this.rounded },
      failMessage: () => {
        const rounded = Math.round(result*Math.pow(10,precision))/Math.pow(10,precision)
        return `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be close to "${expected}" (by a precision of ${precision}), got "${result}" instead, 
      which was adjusted to ${rounded} – a deviation of ${Math.round(Math.abs(expected-rounded)*Math.pow(10,precision))/Math.pow(10,precision)}`
      }
    }},
    toBeDefined: () => { return {
      test: () => result !== undefined,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be defined (i.e. strictly ${matchWrappers.polarity ? 'not ' : ''}equal "undefined"), got "${result}" instead`
    }},
    toBeFalsy: () => { return {
      test: () => result == false,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be falsy (i.e. loose equality match of false), got "${result}" instead` 
    }},
    toBeGreaterThan: (expected) => { return {
      test: () => result > expected,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be greater than ${expected}, got "${result}" instead` 
    }},
    toBeGreaterThanOrEqual: (expected) => { return {
      test: () => result >= expected,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be greater than or equal to ${expected}, got "${result}" instead` 
    }},
    toBeLessThan: (expected) => { return {
      test: () => result < expected,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be less than ${expected}, got "${result}" instead` 
    }},
    toBeLessThanOrEqual: (expected) => { return {
      test: () => result <= expected,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be less than or equal to ${expected}, got "${result}" instead` 
    }},
    toBeNaN: () => { return {
      test: () => Number.isNaN(result),
      failMessage: () => `Expected subject ${matchWrappers.polarity ? 'not ' : ''} to be a number (using Number.isNaN), got "${result}" instead` 
    }},      
    toBeNegativeInfinity: () => { return {
      test: () => result === -Infinity,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? 'not ' : ''} to be negative infinity, got "${result}" instead` 
    }},
    toBeNull: () => { return {
      test: () => result === null, 
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be null, got "${result}" instead` 
    }},
    toBePositiveInfinity: () => { return {
      test: result === Infinity,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? 'not ' : ''} to be positive infinity, got "${result}" instead` 
    }},
    toBeTruthy: () => { return {
      test: () => result == true,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be truthy (i.e. loose equality match of true), got "${result}" instead` 
    }},      
    toBeUndefined: () => { return {
      test: () => result === undefined,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to be undefined (i.e. strictly ${matchWrappers.polarity ? '' : 'not '}equal "undefined"), got "${result}" instead`
    }},
    toEqual: (expected) => { return {
      test: () => result == expected, // NOTE: Should do deep comparison, like Jasmine
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to equal "${expected}", got "${result}" instead`
    }},
    toMatch: (expected) => { return {
      test: () => result.match(expected) ? true : false,
      failMessage: () => `Expected subject ${matchWrappers.polarity ? '' : 'not '}to match "${expected}", got "${result}" instead`
    }}
  }

  const matchWrappers = {polarity: true}

  for (let key in matchers ) {
    matchWrappers[key] = new Proxy(matchers[key], {
      apply: (target, thisArg, argumentsList) => {
        let result = null

        try { 
          const matcher = target.apply(this, argumentsList)
          
          // flip polarity in response to .not qualifier
          result = matchWrappers.polarity ? matcher.test() : !matcher.test()

          if (!result) {
            ICS_Spec.itPasses = false
            console.log('  FAILED TEST: It ' + ICS_Spec.itDescription)
            console.log(`    ${matcher.failMessage()} `)
          }
        } catch(e) {
          ICS_Spec.counts.failed++
          console.log('Encountered error will trying to run tests. \n')
          console.log(e)
          result = e
        }
        return result
      }
    })
  }
  const proxies = new Proxy(matchWrappers, {
    get: (t,p,r) => {
      if (p === 'not') {
        matchWrappers.polarity = false
        return matchWrappers
      }
      return t[p]
    }
  })
  return proxies
}