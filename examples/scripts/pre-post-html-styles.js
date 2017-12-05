{
  const example = new InlineCodeSuite({ 
    name: 'pre-post-html-styles',
    root: document.querySelector('pre-post-html-styles'), 
    height: 200,
    editors: [
      {
        name: 'HTML',
        mode: 'htmlmixed',
        value: `<div class="test">This is content visible in the editor and modifed by hidden CSS.</div>`
      }
    ],
    preview: {
      styles: `
        .test { background: hsl(187, 100%, 42%); color: white; padding: 1rem; margin: 0.5rem; }
        div { color: #555; margin: 0.5rem; background: #eee; padding: 1rem; }
      `,
      html: {
        pre: '<div>This is pre-content HTML not visible in any editors.</div>',
        post: '<div>This is post-content HTML not visible in any editors.</div>'
      }
    }
  })
}