document.onreadystatechange = function () {  
  if (document.readyState == "interactive") {
    const rootElement = document.getElementsByTagName('app-root')[0]
    new InlineCodeSuite({ 
      name: 'Test1',
      root: rootElement, 
      height: 400,
      editors: [
        { name: 'More JS',
          module: 'javascript',
          value: 'whatever'
        },
        {
          name: 'HTML',
          mode: 'htmlmixed',
          value: '<div>hi</div>'
        },
        {
          name: 'JS',
          mode: 'javascript',
          value: 'console.log("yo!")'
        },
        {
          name: 'CSS',
          mode: 'css',
          value: '.woot {}'
        }
      ],
      scripts: [
        {
          type: 'text/javascript',
          value: 'console.log("hidden script")'
        }
      ]
    })

    new InlineCodeSuite({ 
      name: 'Test2',
      root: rootElement, 
      height: 400,
      editors: [
        {
          name: 'JS',
          mode: 'javascript',
          value: 'console.log("yo!")'
        },
        {
          name: 'User Tests',
          mode: 'javascript',
          value: 'console.log("run test!")',
          preview: false,
          runButton: 'TEST!'
        }
      ],
      scripts: [
        {
          type: 'text/javascript',
          value: 'console.log("hidden script")'
        },
        {
          type: 'text/javascript',
          value: 'console.log("clicked submit")',
          runButton: 'Submit'
        }
      ]
    })
  }
}
