# Security policy

PRO Threads is a static site with no server code: it draws in the browser with WebGL and keeps its settings in the page's URL. The parts most worth a look are the `<pro-threads>` web component (`embed.js`), which builds an iframe address from its attributes, and the Embed dialog (`share.js`), which builds code snippets from the page's URL.

## Supported versions

Only the latest code on the `main` branch is supported.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub's security advisories instead: on this repository, go to **Security → Advisories → Report a vulnerability** ([direct link](https://github.com/kubai087/pro-threads/security/advisories/new)).

Include what you found, the steps or a page URL that reproduces it, and the browser you used. You will get a reply on the advisory, and a fix will be credited to you if you wish.
