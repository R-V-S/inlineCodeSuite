# Changelog

## [0.9.0] - 2018-01-08
### Added
  - Various keyboard shortcuts 
  - Support for multiple cursors
  - `autoPreview` option to allow HTML & CSS changes to automatically update the preview even when `autoRun` is set to `false`
  - Material Icons

### Changed
  - Refactored inlineCodeConsole so that it uses the existing compiler
  - Refactored preview so that it catches errors and displays them in the inline console
  - Less funny console responses to attempted alerts or console logs
  - Slightly more verbose error messages
  - Refactored top-level settings so that they're consolidated under one settings object

### Fixed
  - Fixed issue where alerts in the console would return a message about a failed match
  - Fixed issue where using document object would cause either the script or the console to report errors (or fail silently). This replaces a short term fix that suppressed any document-related errors (along with subsequent errors).

### Known Issues
  - Logging the document object from a script tab logs nothing (document is now a black hole/trap in the compiler)
  - Displaying line numbers in errors is problematic because the scripts are merged together before compiling

## [0.8.0] - 2018-01-05
### Added
  - Experimental fullscreen mode (documentation intentionally omitted for the time being – flying this one under the radar for now)

## [0.7.1] - 2018-01-05
### Added
  - Ability to store current user content to LocalStorage, including:
    - A `useLocalStorage` setting, which defaults to `true`
    - A refresh button in the lower left to restore default values
  - `setPreviewSettings` method added

### Changed
  - Editor content is saved in LocalStorage by default
  - JSHint warnings about undefined variables have been disabled

## [0.6.3] - 2018-01-04
### Fixed
  - Fixed issue where incomplete tags in HTML tab were causing the script tags defined beneath them to show up

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