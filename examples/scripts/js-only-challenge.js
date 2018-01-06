{
  const example = new InlineCodeSuite({ 
    name: 'js-only-challenge',
    root: document.querySelector('js-only-challenge'), 
    height: 400,
    enableFullscreen: true,
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
          describe("Your function with example tests", () => {
            it("should add two positive numbers", () => {
              expect( add(2,2) ).toBe(4);
            });
            it("should add a positve number with zero", () => {
              expect( add(30,0) ).toBe(30);
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
        value: `
          describe("Your function for the final round", () => {
            it("should add positive numbers", () => {
              expect( add(10,1) ).toBe(11);
            });
            it("should add positive and negative numbers", () => {
              expect( add(-2,2) ).toBe(0);
            });
            it("should add zero and zero", () => {
              expect( add(0,0) ).toBe(0);
            });
          });          
        `,
        runButton: 'Submit'
      }
    ]
  })
  // example.addEventListener('compilerWillRun', (data) => { console.log('compilerWillRun event!', data) } )
  example.addEventListener('compilerDidRun', (data) => { 
    if (data.outputData.spec.run) {
      const description = data.outputData.spec.description
      const result = data.outputData.spec.passed ? 'passed!' : 'failed :/'
      console.log( `A spec was run, and the spec ${result} \nThe spec was testing: ${description}`)
    }
  })
}