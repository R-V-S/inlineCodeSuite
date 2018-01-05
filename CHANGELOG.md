# Changelog

## [Unreleased]

## [0.7.0] - 2018-01-5
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