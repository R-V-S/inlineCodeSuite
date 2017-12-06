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

### Read-only editors

InlineCodeSuite allows individual editor tabs to be set to read-only, allowing you to show code to the user without allowing the user to modify it. Example use cases:

  * You want the user to experiment with a CSS concept, so you might have two editor tabs, one for CSS and one for HTML. The HTML tab could be set to read-only. This would allow the user to see (but not edit) the HTML they're writing styles for, which could help them understand the relationship between the CSS rules and the structure of the HTML.
  * You want users to be able to see tests that are going to be performed on their code without being able to edit the tests.

## Installation using NPM

Run the install command:

```bash
$ npm install -S inline-code-suite
```

Then, use the `import` command in supported environments (Babel-transpiled code or supported browsers): 

```js
import 'inline-code-suite' as InlineCodeSuite;
```

Or use `require` in supported environments (Node.js, Electron):

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

Where version is the version number, minus the preceeding `v`, e.g. `inline-code-suite-0.1.2`.

## Usage

Once including/imported/required, `InlineCodeSuite` is a class. Instantiate the class and pass it **an object** with the following properties:

* `name`: A string that can be used to target this instance of `InlineCodeSuite`. Adds an id of `inlineCodeSuite-{name}` to the container element, where `{name}` is "slugified" ("Hello World!!" => "hello-world")
* `root`: The DOM object that the code suite will be attached to
* `height` (optional): A string that defines the height of the code suite. Defaults to `300px`
* `autorun` (optional): A boolean that defines whether the preview pane updates automatically when editor content changes. Defaults to `true`
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
* `importScripts` (optional): An array of strings declaring relative filenames. The compiler will import these files inside the script's execution context. You can use this to define dependencies or alter the context itself
* `scripts` (optional): An array of objects. Each object declares a new non-editor script. Each script object accepts the following properties:
  * `type`: A string. A valid HTML `type` attribute like `text/javascript`
  * `value`: A string. The script's code
  * `runButton` (optional): A string that defines the name of the button that will execute the code on click
* `preview` (optional): An object that defines preview settings, if a preview exists
  * `html` (optional): An object that can be used to add rendered HTML to the preview, if you want HTML code to appear in the preview but not in the HTML editor
    * `pre` (optional): HTML code to be added before the HTML editor code in the preview
    * `post` (optional): HTML code to be added after the HTML editor code in the preview
  * `styles` (optional): Additional styles added to the preview that are not visible to the user

## FAQ

### Can I access the contents of the editor from within a script?

Yes, scripts have access to a variable named `inlineCodeSuite`. That variable has a property, `editors`. `inlineCodeSuite.editors` is an object containing editor data, and individual editors can be accessed by the name of the editor. In addition to the initial properties passed to the editor during creation (`name`, `mode`, `value`, `hasPreview`, `runButton`, and `preserveBaseIndentation`), each editor also has a `userValue` property that stores the current state of the editor's contents at compile time. For example, if you have an editor named `CSS`, you could access its current contents from your script through `inlineCodeSuite.editors['CSS'].userValue`.