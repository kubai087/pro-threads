# Contributing to PRO Threads

Thanks for your interest in improving PRO Threads. Bug reports, ideas, new palettes, letters, scenes and fixes are all welcome.

## Before you start

- For a bug, [open an issue](https://github.com/kubai087/pro-threads/issues/new/choose) with the page URL (the settings are in it), your browser and what you expected to see.
- For a larger change, such as a new scene or a change to the shaders' look, open an issue first so the approach can be agreed before you spend time on it.
- For a security problem, do not open an issue; see [SECURITY.md](SECURITY.md).

## Run it locally

There is no build step and nothing to install. Serve the folder over HTTP, since ES modules do not load from `file://`:

```bash
git clone https://github.com/kubai087/pro-threads.git
cd pro-threads
python3 -m http.server 8765
```

Open <http://localhost:8765> for the wallpaper and <http://localhost:8765/hero/> for the hero scenes. Edit a file and reload the page. A hard reload (bypassing the cache) also resets the settings kept in the URL.

Useful while working:

- `?t=7` holds one moment, so you can compare a change frame for frame.
- `?ui=0` hides the panel; `H` toggles it.
- On the wallpaper, the panel's **Performance** folder shows the frame rate and the pixels drawn; on the hero page, the landing page's left layout (`?layout=left`) charts the frame time.
- Exposed for the browser console: `window.__wall` on the wallpaper and `window.__hero` on the hero page, each with `state`, `draw` and `pane`.

## Code style

The code is small, dependency-free and meant to be read. Please keep it that way.

- **Plain ES modules, no build.** Use `import` / `export` between files with relative paths. Do not add a bundler, transpiler or package dependencies. External libraries (currently Tweakpane and its Essentials plugin) are imported from jsDelivr with an exact version.
- **Modern JavaScript** that runs as-is in current browsers: `const` and `let`, arrow functions, template literals, optional chaining.
- **Formatting.** Two-space indentation, LF line endings, UTF-8, a final newline (see [`.editorconfig`](.editorconfig)). Single quotes and semicolons in JavaScript; trailing commas in multi-line literals.
- **Shaders** live in template strings (`shader.js`, `hero/shaders.js`) as GLSL ES 3.00 (`#version 300 es`) for WebGL 2.
- **Comments explain the code.** Each file starts with a short block saying what it is for, and functions and non-obvious steps get a plain-English comment on what they do and why. Comments describe the code as it is; leave history and discussion for commit messages and pull requests.
- **Names** are short and descriptive; panel labels are plain English, and any new label also needs its Chinese text in `i18n.js`.
- **Settings.** A new panel value belongs in the page's `DEFAULTS`, so it is read from and written to the URL automatically. Keep the URL parameter names stable; links people have shared depend on them.
- **Shared code** used by both pages (palettes, pacing, URL settings, menus, translations, the Embed dialog) stays in the root modules rather than being copied.

Check your change in Chrome, Safari and Firefox if you can, with the panel shown and hidden, and at a phone size (`?width=402&height=874&scale=3`).

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>
```

- **Types:** `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.
- **Scope** is optional, e.g. `wallpaper`, `letters`, `hero`, `embed`, `panel`, `i18n`.
- **Summary** in the imperative mood, lowercase start, no trailing period, ideally 72 characters or fewer.
- Add a body after a blank line when the reason needs explaining.
- For a breaking change (for example, renaming a URL parameter or a `<pro-threads>` attribute), add `!` after the type or scope and a `BREAKING CHANGE:` footer.

Examples:

```
feat(hero): add a spiral scene
fix(letters): close the gap in Q's tail at small sizes
perf(wallpaper): skip the fibre pass when sparkle is zero
docs: document the hero URL parameters
```

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep each pull request to one change, and describe what it does and how you checked it.
3. For a visual change, include before and after screenshots (with `?t=` so they show the same moment) and the page URLs.
4. Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md) for anything a user would notice.
5. If you change a setting, URL parameter or the web component, update [README.md](README.md) to match.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
