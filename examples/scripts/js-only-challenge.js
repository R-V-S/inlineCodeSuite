{
  const example = new InlineCodeSuite({ 
    name: 'js-only-challenge',
    root: document.querySelector('js-only-challenge'), 
    height: 400,
    editors: [
      {
        name: 'JS',
        mode: 'javascript',
        value: `
function add(a, b) {
return a + b;
}`
      },
      {
        name: 'Example Tests',
        mode: 'javascript',
        value: `
describe("Your function", () => {
it("should work", () => {
  Test.assertEquals(add(2,2), 4 , "Sum should be 4");
  Test.assertEquals(add(30,0), 30 , "Sum should be 30");
});
});
        `,
        hasPreview: false,
        runButton: 'TEST!'
      }
    ],
    scripts: [
      {
        type: 'text/javascript',
        value: `const describe = (subject, tests) => {
          console.log(\`Testing \${subject.toLowerCase()}...\`)
          tests()
          console.log(\`\n\${Test.run} tests run. \${Test.failed} failed. \${Test.passed} passed.\`)
          if (Test.failed === 0) { console.log('HUZZAH!!!') } else { console.log('FAIL.')}
        };
        
        const it = (test, tests) => {
          tests()
          
        }
        
        const Test = {
          run: 0,
          passed: 0,
          failed: 0,
          assertEquals: (actual, ideal, message) => {
            Test.run++
            if (actual === ideal) {
              Test.passed++
              console.log(\`Passed: \${message}\`)
            } else {
              Test.failed++
              console.log(\`Failed: \${message}\`)
            }
          }
        }
        `
      },
      {
        type: 'text/javascript',
        value: `
describe("final round of tests", () => {
it("should work", () => {
  Test.assertEquals(add(-2,2), 0 , "Sum should be 0");
  Test.assertEquals(add(10,1), 11 , "Sum should be 11");
  Test.assertEquals(add(0,0), 0 , "Sum should be 0 again");
});
});          
        `,
        runButton: 'Submit'
      }
    ]
  })
  example.addEventListener('compilerWillRun', (data) => { console.log('compilerWillRun event!', data) } )
  example.addEventListener('compilerDidRun', (data) => { console.log('compilerDidRun event!', data) } )
}