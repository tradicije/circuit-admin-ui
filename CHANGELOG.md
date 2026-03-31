# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial plugin scaffold for `Circuit Admin UI`.
- Global admin UI redesign with custom modern visual system.
- Dark/Light theme switch in admin bar with per-user persistence (user meta) and local fallback.
- Gutenberg/editor visual restyle to match the custom admin theme.
- Note-editor style experience for post editor screens.
- Metabox tabs system on post create/edit screens (classic metabox areas) to avoid long stacked sections.
- Keyboard navigation for metabox tabs (`ArrowLeft` / `ArrowRight`).

### Changed
- `caiu-note-editor` behavior expanded from `post-new.php` to both `post-new.php` and `post.php`.
- Dark mode coverage expanded across additional WordPress admin components (tabs, popovers, plugin/list tables, notices, footer and related UI elements).
