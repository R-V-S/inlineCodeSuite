# Changelog

## [Unreleased]

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