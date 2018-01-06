{
  const example = new InlineCodeSuite({ 
    name: 'pre-post-html-styles',
    root: document.querySelector('pre-post-html-styles'), 
    height: 200,
    // hasConsole: false,
    enableFullscreen: true,
    editors: [
      {
        name: 'HTML',
        mode: 'htmlmixed',
        value: `<div class="test">This is content visible in the editor and modifed by hidden CSS.</div>`
      }
    ],
    scripts: [
    {
      type: 'text/javascript',
      runButton: 'Change Editor Content',
      onRun: () => {
        example.setEditorContent({ name: 'HTML', content: '<div class="test">This should be the new content for the HTML editor, set by an editor button.</div>' })
        example.setPreviewSettings({
          styles: `
            .test { background: hsl(300, 100%, 62%); color: white; padding: 1rem; margin: 0.5rem; }
            div { color: #555; margin: 0.5rem; background: #aaa; padding: 1rem; }
          `,
          html: {
            pre: '<div>This is pre-content HTML just changed!!</div>',
            post: '<div>This is post-content HTML not visible in any editors.</div>'
          }    
        })
      }
    }],
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
  example.setEditorContent({ 
    name: 'HTML', 
    content: `
      <div class="test">
        This is content visible in the editor and modifed by hidden CSS. 
        It's also been set externally.
      </div>` 
  })
}