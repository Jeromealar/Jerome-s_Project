# RAFA website

Static marketing website for Resource Analytics for Future Africa (RAFA). `index.html` is the public landing page; the remaining public pages and the browser-local admin preview live in `pages/`.

## Structure

```
.
├── index.html              Public landing page (site entry point)
├── pages/
│   ├── about.html
│   ├── what-we-do.html
│   ├── c-mink.html
│   ├── insights.html
│   ├── people.html
│   ├── engage.html
│   └── admin.html          Browser-local admin preview (not linked publicly)
├── assets/
│   └── images/             Logos, icon and favicon
├── css/
│   ├── home.css            Landing-page styles
│   ├── styles.css          Supporting-page styles
│   ├── admin.css           Admin-preview styles
│   └── gtranslate.css      Translation widget styles
├── js/
│   ├── home.js             Landing-page interactions
│   ├── main.js             Supporting-page interactions
│   ├── site-data.js        Shared events/contacts/inquiry storage
│   └── admin.js            Admin-preview logic
├── tools/
│   └── check-links.mjs     Internal link and anchor checker
├── projectlog.md           Append-only project history
└── roadmap.md              Project backlog
```

## View the site locally

Run a static server from this folder so relative paths and browser storage behave normally:

```powershell
python -m http.server 8080
```

Then open:

- Public site: <http://localhost:8080/>
- Admin preview: <http://localhost:8080/pages/admin.html>

Opening `index.html` directly with `file://` also works for browsing, but the admin preview and local storage are best tested through a local server.

## Link conventions

- `index.html` links to inner pages with `pages/<page>.html`.
- Files inside `pages/` link to each other by filename only (for example `engage.html#briefing-section`).
- Files inside `pages/` reach shared assets with `../`: `../index.html`, `../css/`, `../js/`, `../assets/images/`.
- All images, including `favicon.svg`, live in `assets/images/`.
- In-page anchors must match an existing `id` on the same page.

## Check links

From the project root:

```powershell
node tools/check-links.mjs
```

The checker validates every local `href`, `src` and `action` across all HTML files, including cross-page `#anchors`, and exits with a non-zero code if anything is broken.

## Notes

- The site is static; events, contacts, uploaded publications and inquiries are stored only in the current browser (`js/site-data.js`, IndexedDB for PDFs).
- `pages/admin.html` and `js/admin.js` are a working preview, not a production admin with authentication.
- The footer LinkedIn link is still a generic placeholder and should be replaced with RAFA's verified profile URL.
