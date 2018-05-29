{
  const example = new InlineCodeSuite({ 
    name: 'manual-run-js',
    root: document.querySelector('js-only-challenge'), 
    height: 400,
    enableFullscreen: true,
    editors: [
      {
        name: 'JS',
        mode: 'javascript',
        value: `
          class Person {
            constructor(name, age, hometown) {
              this.name = name;
              this.age = age;
              this.hometown = hometown;
              this.type = 'Student';
            }
            getName() {
              return this.name;
            }
          }
        `,
        runButton: 'Run'
      }
    ]
  })
}