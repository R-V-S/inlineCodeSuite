# Changelog

## [Unreleased]

## [0.6.3] - 2018-01-04
### Fixed
  - Fixed issue where incomplete tags in HTML tab were causing the script tags defined beneath them to show up

## [0.6.2] - 2018-01-04
### Fixed
  - documentation on autoRun 
  - console inherits code from a successful execution (note: only if no variables that are unknown in the scope of the compiler/worker are used, meaning it may not work as expected when the editor's JS uses the `document` object)

## [0.6.1] - 2017-12-22
### Fixed
  - rebuilt 

## [0.6.0] - 2017-12-22
### Added
  - basic testing suite
  - `compilerDidMount` event

## [0.5.0] - 2017-12-20
### Added
  - changelog!
  - `hasConsole` option for ICS instances
  - `setEditorContent` method for ICS instances
  - `onRun` callback for scripts so that code can be executed in the same scope of the ICS instance when a run button is clicked

### Changed
  - `stripIndentation` method now also runs `trim` to remove beginning/ending whitespace. Changed to remove unintentional newline at the beginning of content

### Fixed
  - Resolved issue where JS editor content wouldn't update the preview if it tried to reference `document` object