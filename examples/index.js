const b = 8;

document.onreadystatechange = function () {  
  if (document.readyState == "interactive") {
    const rootElement = document.getElementsByTagName('app-root')[0]
    const example1 = new InlineCodeSuite({ 
      name: 'example-1',
      root: rootElement, 
      height: 400,
      editors: [
        {
          name: 'HTML',
          mode: 'htmlmixed',
          value: `
<div id="sun">
  <div class="ring">
    <div class="box"></div>
    <div class="box"></div>
  </div>
  <div class="globe"></div>
  <div class="eyes">
    <div class="eye left-eye"></div>
    <div class="eye right-eye"></div>
  </div>
  <div class="mouth">
    <div class="lips">
  </div>
</div>
`
        },
        {
          name: 'JS',
          mode: 'javascript',
          value: ''
        },
        {
          name: 'CSS',
          mode: 'css',
          value: `
body {
  background: hsl(200, 100%, 90%);
  margin-top: 3rem;
}
#sun {
  position: relative;
  width: 300px;
  height: 300px;
  margin: auto;
}

#sun > div {
  position: absolute;
}

.globe {
  width: 66%;
  height: 66%;
  background: hsla(44, 100%, 60%, 1);
  border-radius: 50%;
  transform: translateX(25%) translateY(25%);
}

.ring {
  animation: spin 5s infinite linear;
  transform-origin: center center;
  width: 63%;
  height: 63%;
  left: 17.5%;
  top: 17.5%;
  text-align: center;
}

.box {
  background: hsla(44, 100%, 90%, 1);
  width: 100%;
  height: 100%;
  position: absolute;
  transform-origin: center center;
}

.box:first-child {
  transform: rotate(45deg);
}

.eyes {
  transform: translateX(73px) translateY(120px);
  position: absolute;
}

.eye {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
}

.right-eye {
  left: 120px;
}

.eye:nth-of-type(5) {
  transform: translateX(60vmin) translateY(47vmin);
}


.mouth {
  overflow: hidden;
  width: 200px;
  height: 30px;
  transform: translateX(62.5px) translateY(160px)
}

.lips {
  border-radius: 50%;
  width: 172px;
  height: 42px;
  border: 1vmin solid rgba(0,0,0,0.5);
  box-sizing: border-box;
  margin-top: -5vmin;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
          `
        }
      ],
      scripts: [
        {
          type: 'text/javascript',
          value: 'window.a = 7'
        }
      ],
      importScripts: ['test.js']
    })

    example2 = new InlineCodeSuite({ 
      name: 'example-2',
      root: rootElement, 
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
    example2.addEventListener('compilerWillRun', (data) => { console.log('event!', data) } )

    example3 = new InlineCodeSuite({ 
      name: 'example-3',
      root: rootElement, 
      height: 200,
      editors: [
        {
          name: 'HTML',
          mode: 'htmlmixed',
          value: `<div class="test">test</div>`
        }
      ],
      preview: {
        styles: `
          .test { background: blue; }
        `,
        html: {
          pre: '<div>pre html</div>',
          post: '<div>post html</div>'
        }
      }
    })
  }

}
