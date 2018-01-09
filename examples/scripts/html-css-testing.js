{
  const example = new InlineCodeSuite({ 
    name: 'html-css-testing',
    root: document.querySelector('html-css-testing'), 
    height: 400,
    // useLocalStorage: false,
    enableFullscreen: true,
    autoRun: false,
    autoPreview: true,
    editors: [
      {
        name: 'HTML',
        mode: 'htmlmixed',
        value: `
          <ul id="list">
            <li>biker jacket</li>
            <li>mens t-shirt</li>
          </ul>
        `
      },
      {
        name: 'CSS',
        mode: 'css',
        value: `
          .clothing-list {
            background: blue;
            padding: 3rem;
          }
        `
      },
      {
        name: 'Tests',
        mode: 'javascript',
        hasPreview: false,
        value: `
          describe("List", () => {
            const ul = document.getElementById('list');
            const items = ul.getElementsByTagName('li');
            
            it("should exist", () => {
              expect(ul).not.toBeNull();
            });
          
            it("should have a list item with the text 'Biker Jacket'", () => {
              expect(items[0].innerText.toLowerCase()).toBe('biker jacket');
            });
          
            it("should have a list item with the text 'Mens T-shirt'", () => { 
              expect(items[1].innerText.toLowerCase()).toBe('mens t-shirt');
            });
            
            it("should have a class named 'clothing-list'", () => {
              expect(ul.classList.contains('clothing-list')).toBeTruthy()
            });
            
            it("should have pink background", () => {
              expect( window.getComputedStyle(ul).backgroundColor ).toBe('rgb(255, 192, 203)')
            });
          });
        `,
        runButton: 'Test!'
      }
    ]
  })
}
