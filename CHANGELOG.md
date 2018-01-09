# Changelog

## [Unreleased] - 2018-01-09
### Added
  - `beforeEach` and `afterEach` test functions, based on Jasmine
  - Support for pending tests through the `xit` function
  - Disabled suites through the `xdescribe` function
  
### Changed  
  - In an `it` block, the `this` keyword is now an empty object that is cleared between calls to `it`
  - Improved test failure messages

### Fixed
  - Incorrect test counting – based on expect calls rather than it calls

## [0.9.0] - 2018-01-08
### Added
  - Various keyboard shortcuts 
  - Support for multiple cursors
  - `autoPreview` option to allow HTML & CSS changes to automatically update the preview even when `autoRun` is set to `false`
  - Material Icons instead of unicode symbols for operation buttons
  - Support for `.not.` qualifier for tests, like Jasmine
  - Ability to run tests on preview content (`document` object access)
  - Better failure messages for tests

### Changed
  - Console component refactored so that it uses the existing compiler rather than its own instance
  - Preview component refactored so that it catches errors and displays them in the inline console
  - More meaningful console responses to attempted alerts 
  - Error messages slightly more verbose
  - Top-level settings consolidated under one settings object
  - Test suite and web worker templates are split out into their own files

### Fixed
  - Alerts in the console would return a message about a failed match
  - Using document object would cause either the script or the console to report errors (or fail silently). This replaces a short term fix that suppressed any document-related errors (along with subsequent errors).
  - An infinite loop could still lock up if it's in an editor on initial page load (e.g. if it was saved to localStorage)

### Known Issues
  - Displaying line numbers in errors is problematic because the scripts are merged together before compiling

## [0.8.0] - 2018-01-05
### Added
  - Experimental fullscreen mode (documentation intentionally omitted for the time being – flying this one under the radar for now)

## [0.7.1] - 2018-01-05
### Added
  - Ability to store current user content to localStorage, including:
    - A `useLocalStorage` setting, which defaults to `true`
    - A refresh button in the lower left to restore default values
  - `setPreviewSettings` method added

### Changed
  - Editor content is saved in localStorage by default
  - JSHint warnings about undefined variables have been disabled

## [0.6.3] - 2018-01-04
### Fixed
  - Incomplete tags in HTML tab were causing the script tags defined beneath them to show up

## [0.6.2] - 2018-01-04
### Fixed
  - Documentation on autoRun 
  - Console inherits code from a successful execution (note: only if no variables that are unknown in the scope of the compiler/worker are used, meaning it may not work as expected when the editor's JS uses the `document` object)

## [0.6.1] - 2017-12-22
### Fixed
  - Rebuilt 

## [0.6.0] - 2017-12-22
### Added
  - Basic testing suite
  - `compilerDidMount` event

## [0.5.0] - 2017-12-20
### Added
  - Changelog!
  - `hasConsole` option for ICS instances
  - `setEditorContent` method for ICS instances
  - `onRun` callback for scripts so that code can be executed in the same scope of the ICS instance when a run button is clicked

### Changed
  - `stripIndentation` method now also runs `trim` to remove beginning/ending whitespace. Changed to remove unintentional newline at the beginning of content

### Fixed
  - Resolved issue where JS editor content wouldn't update the preview if it tried to reference `document` object