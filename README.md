# InlineCodeSuite

Add dynamic, powerful inline code examples and exercises to your site. 

## Features

### Flex Tabs

With InlineCodeSuite, each coding editor is contained in a tab on the right-hand side. Most inline coding tools are built to handle a fixed number and arrangement of editors. Typically this is one JavaScript, one HTML, and one CSS editor. 

InlineCodeSuite, on the other hand, puts no constraints on the number of editors. Two JS editors? No problem. One JS editor, two CSS editors, and two HTML editors? As long as there's enough horizontal space for the tabs, that's no problem. 

The title for each tab can be specified as well, so there's no confusion about the purpose or context for each tab.
 
Why is this useful? It allows InlineCodeSuite to masquerade as any number of existing inline coding environments. It can emulate:

  * A basic, two-pane REPL
  * A coding exercise/challenge tool with separate editors for example tests
  * A project-style environment with multiple script editors

### Hidden Scripts

InlineCodeSuite supports hidden script content that can be executed either: 

  * Before each update of the preview
  * On button click

Why is this useful? You can prep an exercise or example with code that the user doesn't need to see. If you want to demonstrate how event listeners work, for example, then you only need to expose the event listener code in the example while the rest of the code is hidden. Use this to show simple example code that has a cool and impressive output.

### Hidden HTML & CSS

Just line scripts, HTML and CSS can be hidden as well, which allows you to create beautiful, complex examples/challenges, while only exposing to the end user the content that's immediately relevant. 

### Flex Buttons

In addition to a flexible number of editor tabs, InlineCodeSuite also allows both editor content and/or hidden script content to be executed via button click. There can be as many buttons as

### Client-side Evaluation and Preview

By default, code evaluation happens client-side. This has both advantages and disadvantages. Advantages are:

  * Lightning-fast preview updates, which are especially noticeable when working with HTML and CSS
  * Bypass server-side security concerns 

Disadvantages are: 

  * By default, user content isn't saved. The user's work will be lost on page close/reload. This can be addressed by adding a hidden script that saves the editor content, either via a server call or session/local storage.

### Read-only Editor Tabs

InlineCodeSuite allows individual editor tabs to be set to read-only, allowing you to show code to the user without allowing the user to modify it. Example use cases:

  * You want the user to experiment with a CSS concept, so you might have two editor tabs, one for CSS and one for HTML. The HTML tab could be set to read-only. This would allow the user to see (but not edit) the HTML they're writing styles for, which could help them understand the relationship between the CSS rules and the structure of the HTML.
  * You want users to be able to see tests that are going to be performed on their code without being able to edit the tests.

### Evaluation Using Web Workers

Code execution feels fast and zippy because it's handled by web workers, which don't block the UI thread and can terminate gracefully if the script times out (i.e. if an infinite loop is accidentally created). 

## Installation using NPM

Run the install command:

```bash
$ npm install -S inline-code-suite
```

Then, use the `import` command in supported environments (Babel-transpiled code or supported browsers): 

```js
import 'inline-code-suite' as InlineCodeSuite;
```

Or use `require` in supported environments (Electron):

```js
InlineCodeSuite = require('inline-code-suite');
```

## Installing using the CDN

Add the script to the HTML file:

```html
<script src="https://d2atlz6q4yph1d.cloudfront.net/dist/inline-code-suite.js"></script>
```

You can access specific versions, as well:

```html
<script src="https://d2atlz6q4yph1d.cloudfront.net/dist/inline-code-suite-{version}.js"></script>
```

Where version is the version number, minus the preceding `v`, e.g. `inline-code-suite-0.1.2`.

## Usage

### Initialization 

Once including/imported/required, `InlineCodeSuite` is a class. Instantiate the class and pass it **an object** with the following properties:

* `name`: A string that can be used to target this instance of `InlineCodeSuite`. Adds an id of `inlineCodeSuite-{name}` to the container element, where `{name}` is "slugified" ("Hello World!!" => "hello-world")
* `root`: The DOM object that the code suite will be attached to
* `height` (optional): A string that defines the height of the code suite. Defaults to `300px`
* `autoRun` (optional): A boolean that defines whether code automatically runs when editor content changes. This is applies to all editor types, including HTML and CSS editor tabs. Defaults to `true`
* `autoPreview` (optional): A boolean that defines whether the preview pane updates automatically when HTML and CSS editor tab content changes. Defaults to `true`. Use this if `autoRun` is set to `false` to prevent script tabs from auto-running, but you still want the preview to update automatically when HTML and CSS changes are made
* `useLocalStorage` (optional): A boolean that determines whether or not editor content is stored and loaded from localStorage. Defaults to `true`
* `editors`: An array of objects. Each object declares a new editor. Each editor object accepts the following properties:
  * `name`: The text that appears in the editor's tab
  * `mode`: A string that defines a valid scripting mode. Must be one of:
    * `css`
    * `htmlmixed`
    * `javascript`
    * `jsx`
    * `ruby`
  * `value`: A string. The starting code for the editor
  * `hasPreview` (optional): A boolean that determines whether or not the editor's code should be run when the preview pane is updated
  * `preserveBaseIndentation` (optional): A boolean that disables the default stripping of excess left-side indentation if set to `true`
  * `runButton` (optional): A string that defines the name of the button that will execute the code on click
  * `readOnly` (optional): A boolean that disables the ability to edit the editor's contents if set to `true`. They can still see and select/highlight/copy the content
* `hasConsole` (optional): A boolean that determines whether or not there's a console tab. Defaults to `true` 
* `importScripts` (optional): An array of strings declaring relative filenames. The compiler will import these files inside the script's execution context. You can use this to define dependencies or alter the context itself
* `scripts` (optional): An array of objects. Each object declares a new non-editor script. Each script object accepts the following properties:
  * `type`: A string. A valid HTML `type` attribute like `text/javascript`
  * `value` (optional): A string. The script's code. This code will execute inside of a sandboxed environment, so it won't have access to the outer scope in which the inlineCodeSuite is created. It will have access to a variable, `inlineCodeSuite`, that contains editorData (see the FAQ for more details)
  * `onRun` (optional): A callback function. This function will execute in the outer scope in which the inlineCodeSuite is created 
  * `runButton` (optional): A string that defines the name of the button that will execute the code on click
* `preview` (optional): An object that defines preview settings, if a preview exists
  * `html` (optional): An object that can be used to add rendered HTML to the preview, if you want HTML code to appear in the preview but not in the HTML editor
    * `pre` (optional): HTML code to be added before the HTML editor code in the preview
    * `post` (optional): HTML code to be added after the HTML editor code in the preview
  * `styles` (optional): Additional styles added to the preview that are not visible to the user

### Methods

#### `.getEditorData()`

Gets data about the editors, including their current content and history. Takes no parameters and returns an object. The object has a property for each editor. The editor's name is the key. The values are the same as the values that were set during initialization, plus two additional properties for each editor object:

* `userValue`: The current value of the editor, as defined by the user's interactions
* `history`: A stack of editor values, as defined by the user's interactions

#### `.setEditorContent(options)`

Changes the content of an editor tab. Options should be passed in as an object, with the following properties:

* `name`: A string. It must match the provided `name` property for the editor. If no match is found, nothing will happen
* `preserveBaseIndentation` (optional): A boolean. Preserves the base level of indentation of the string passed to it. Defaults to the editor's value (which itself defaults to `true`), if provided
* `clearHistory` (optional): A boolean. Clears the editor's history, preventing undo actions from undoing the change to the editor's content

#### `.setPreviewSettings(preview)`

Changes the `preview` settings object, as outlined above. This is useful if you want to change pre- or post-HTML, or alter the styles dynamically after initialization.

* `preview`: An object that defines preview settings, if a preview exists. 

#### `.addEventListener(type, callback)`

Adds a callback function that's triggered based on specific events. Takes two arguments:

* `type`: A string describing the type of event. Currently, only `compilerWillRun` and `compilerDidRun` are supported
* `callback`: A callback function. It will be passed a data object with information about the code being executed and its output

### Testing

The inlineCodeSuite includes a rudimentary testing suite based on Jasmine. It supports `describe` and `it` methods, as well as the following matchers:

* `toBe(real)`: Matches with strict equality (`===`)
* `toBeCloseTo(expected, precision)`: Matches a number down to the specified precision (number of decimals)
* `toBeDefined()`: Returns true if the result is not `undefined`
* `toBeFalsy()`: Matches loosely to `false`
* `toBeGreaterThan(expected)`: Matches if the result is greater than (`>`) a specified value
* `toBeGreaterThanOrEqual(expected)`: Matches if the result is greater than or equal to(`>=`) a specified value
* `toBeLessThan(expected)`: Matches if the result is less than (`<`) a specified value 
* `toBeLessThanOrEqual(expected)`: Matches if the result is less than or equal to(`<=`) a specified value
* `toBeNaN()`: Matches if the result is NaN (defined by `Number.isNaN()`)
* `toBeNegativeInfinity()`: Matches if the result equals `-Infinity`
* `toBeNull()`: Matches if the result does not strictly equal `null`
* `toBePositiveInfinity()`: Matches if the result equals `Infinity`
* `toBeTruthy()`: Matches loosely to `true`
* `toBeUndefined()`: Matches if the result strictly equals `undefined`
* `toEqual(expected)`: Does a loose and shallow match (note that Jasmine's `toEqual` does a deep comparison, while this does not)
* `toMatch(regex)`: matches result against a given regex

Here's an example of a simple `describe` block:

```js
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
```

## FAQ

### What's the easiest way to get started with InlineCodeSuite?

Clone this repo on your local machine, run `npm install`, and then `npm start`. That will launch `/examples/index.html`, where you can see several variations of the editor in action. Each example is defined in its own script file in `/examples/sccripts`.

Or create a new HTML file and paste the following contents. This is a bare-minimum, "Hello World" example of InlineCodeSuite in action:

```html
<!doctype html>
<html>
  <head>
    <title>InlineCodeSuite Hello World</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <app-root></app-root>
    <script src="https://d2atlz6q4yph1d.cloudfront.net/dist/inline-code-suite.js"></script>
    <script>
      
      new InlineCodeSuite({
        name: 'hello-world',
        root: document.querySelector('app-root'),
        editors: [{
          name: 'HTML',
          mode: 'htmlmixed',
          value: '<div>hello world!</div>'
        }, {
          name: 'CSS',
          mode: 'css',
          value: 'body { background: papayawhip }'
        }, {
          name: 'JS',
          mode: 'js',
          value: ''
        }]
      })
      
    </script>
  </body>
</html>
```

### Can I access the contents of editor tabs from within a script that's passed to InlineCodeSuite?

Yes, scripts have access to a variable named `inlineCodeSuite`. That variable has a property, `editorData`. `inlineCodeSuite.editorData` is an object containing editor data, and individual editors can be accessed by the name of the editor. For example, to access the editor data for an editor named `JS`, use:

```js
inlineCodeSuite.editorData["JS"]
```

In addition to the initial properties passed to the editor during creation (`name`, `mode`, `value`, `hasPreview`, `runButton`, and `preserveBaseIndentation`), each editor also has a `userValue` property that stores the current state of the editor's contents at compile time. For example, if you have an editor named `CSS`, you could access its current contents from your script through: 

```js
inlineCodeSuite.editorData['CSS'].userValue
```

### Can I access the contents of editor tabs from outside of InlineCodeSuite?

Yes, each instance of InlineCodeSuite has a `getEditorData()` method that will return editor data, including a `userValue` property for each editor.