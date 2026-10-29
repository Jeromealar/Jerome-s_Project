# Project log

## 2026-10-29 — RAFA landing-page redesign

- **Asked:** Redesign the RAFA landing page as an interactive, professional, user-friendly introduction to the institution, its work, its audiences and how to get in touch. Use white, gold and green; Bootstrap for responsive layouts; Lucide icons where useful; and a RAFA favicon. Keep this log append-only and use the roadmap as a card board.
- **Decision:** Shape the homepage around the COP31 materials' "from price takers to shapers" message and the Anticipate, Prepare, Position framework. Keep the existing supporting pages and route briefing and partnership requests to their established forms. Use only confirmed institutional details; disclose that legal and operational arrangements are still being finalised.
- **Shipped:** Replaced the homepage with a responsive RAFA landing page; added a dedicated homepage stylesheet and lightweight interactions; retained and surfaced the supplied RAFA logo and favicon; and created the requested roadmap board.

## 2026-10-29 — COP31 meeting invitation

- **Asked:** Find a more engaging way to tell visitors about RAFA's meetings; the flat announcement at the top of the page did not work.
- **Decision:** Remove the top announcement strip. Introduce the COP31 meeting in the hero as a compact, clickable invitation and give it a prominent, designed event feature directly beneath the hero. Use the supplied session title, pavilion, location and conference dates without inventing a session time.
- **Shipped:** Added a clickable hero invitation and responsive COP31 session feature with the Dare to Share 2 title, 9–20 November 2026 dates, Africa Pavilion and Antalya location, plus a link to the existing partnership form. Kept the header clean and verified the event does not cause horizontal overflow.

## 2026-10-29 — Simplify confidentiality notice

- **Asked:** Remove the bracketed backend/security-protocol detail and keep the reassuring confidentiality message.
- **Decision:** Remove only the visitor-facing secure-protocol placeholder; retain the plain-language warning not to send sensitive documents and the assurance about secure follow-up.
- **Shipped:** Simplified the briefing form's confidentiality notice without changing its reassurance.

## 2026-10-29 — RAFA admin preview

- **Asked:** Add an admin side to manage upcoming events and public contacts, receive visitor questions, remove legal-status information, and make updates apply beyond the homepage.
- **Decision:** Simulate the admin for now because the site is static and has no backend. Clearly disclose that saved settings and inquiries are local to the current browser, with no authentication or email notifications; leave notification options for a later decision. Remove legal-status statements from all public pages.
- **Shipped:** Added a directly accessible admin preview with overview, event, contacts and inbox views. Event/contact edits render across the public pages, and public briefing and inquiry submissions appear in the preview inbox. Removed legal-status copy site-wide. Verified inbox reading/deletion, form capture, cross-page rendering and responsive layouts; restored defaults and removed test inquiries.
- **Clarification:** The earlier confidentiality entry's reference to secure follow-up predates the preview-only decision. Current public forms do not promise backend storage or secure follow-up; the admin preview states its browser-local limitations.

## 2026-10-29 — Event calendar, language control and engagement improvements

- **Asked:** Center the homepage COP31 invitation, remove event announcements from the top of supporting pages, provide a click-to-open event control without interrupting homepage reading, allow event create/edit/delete in admin, improve language selection and briefing-request UX, move the mobile menu to the far right, and provide email-composer links plus a list of official contact facts RAFA needs to confirm.
- **Decision:** Use an unobtrusive floating event button with an accessible dialog on supporting pages only; show the closest upcoming event in the centered homepage feature. Expand the preview calendar to multiple events with admin create/edit/delete actions. The user chose to wait for approved French copy, so keep French unavailable and clearly state why rather than imply translation exists. Present briefing requests as a guided three-step flow and use mailto links only when verified addresses are entered.
- **Shipped:** Removed top-of-page event strips and added a floating event dialog to supporting pages; centered the homepage event feature; added multi-event browser-local storage and admin event management; redesigned the language selector as an English/French segmented control with French disabled pending approved copy; moved hamburger controls to the far right; rebuilt the briefing form as a three-step, review-before-send flow; added icon-led general, diplomatic/briefing, partnership, and media email links plus an address card. Added the admin checklist for the four official email addresses and Secretariat mailing address that must be confirmed before publication.

## 2026-10-29 — Homepage event popup consistency

- **Asked:** Make the homepage event card behave like the event icon on the other pages.
- **Decision:** Use the same floating calendar button and accessible upcoming-events popup throughout the public site, rather than keeping a separate persistent event card and hero invitation on the homepage.
- **Shipped:** Removed the homepage event card and hero event link, enabled the shared event popup on the homepage, and styled its floating control and dialog in the homepage palette. Verified the button opens the COP31 details and the event card is no longer in the reading flow.

## 2026-10-29 — Add website translation widget

- **Asked:** Add the provided Elfsight website translator widget.
- **Decision:** Install the supplied widget instance on each public page and remove the placeholder English/French selectors, leaving the private admin preview unchanged.
- **Shipped:** Added the Elfsight platform script and widget mount to the homepage and all six supporting public pages.

## 2026-10-29 — Switch translation widget to GTranslate

- **Asked:** Use the supplied GTranslate floating widget for website translation instead.
- **Decision:** Replace the Elfsight embed on all public pages with the exact GTranslate settings supplied: English default, browser-language detection, and the requested language list. Keep the admin preview unchanged.
- **Shipped:** Added the GTranslate wrapper, configuration and deferred widget script to the homepage and all six supporting pages.

## 2026-10-29 — Match GTranslate embed settings and responsive sizing

- **Asked:** Update the widget to the shorter supplied configuration and make its size adapt to devices.
- **Decision:** Use the provided GTranslate settings without explicit position overrides, and add responsive CSS for the floating switcher, flags, language list, and safe-area spacing.
- **Shipped:** Updated all public pages to the exact settings object and added shared mobile-aware widget sizing rules.

## 2026-10-29 — Refine directional icon use

- **Asked:** Reduce the overuse of directional and arrow icons and use more creative visual cues.
- **Decision:** Keep interface labels explicit and replace repeated decorative arrows with subtle underlines, dots, and a diamond marker; reserve Lucide icons for meaningful concepts rather than generic direction.
- **Shipped:** Removed repeated arrow icons and arrow glyphs from the public landing page, briefing flow, contact cards, and admin links; updated link and card styling with understated non-directional cues.

## 2026-10-29 — Simplify page headers and add library uploads

- **Asked:** Remove the top-bar institution label and October 2026 review date, and let admins upload articles to the Insights Library.
- **Decision:** Remove the entire redundant dark header strip from the supporting pages. Add PDF uploads with article metadata to the existing browser-local admin preview, store files in IndexedDB, and show uploaded publications in the public library on the same browser; disclose that this preview does not publish to other visitors.
- **Shipped:** Removed the strip from all six supporting pages and added an admin Insights Library panel to add and remove PDF articles. Uploaded PDFs are searchable/filterable in the public library and open in a new tab. Files and details remain local to the current browser until a shared backend is configured.

## 2026-10-29 — Make text links clear on touch devices

- **Asked:** Ensure text links are visibly distinct on mobile while retaining the smooth desktop underline hover animation.
- **Decision:** Make the underline full-width by default. Apply the short resting underline and animated expansion only to desktop-width fine-pointer devices that support hover.
- **Shipped:** Scoped desktop text-link animation to `@media (hover: hover) and (pointer: fine) and (min-width: 768px)`, leaving a persistent full underline on mobile and touch layouts even when browser emulation reports hover support.

- **Follow-up:** Mobile preview showed that viewport resizing alone can report hover capability; changed the base style to a full underline and made the animated desktop treatment an explicit fine-pointer, minimum-width enhancement.

## 2026-10-29 — Align mobile navigation to the right

- **Asked:** Align the hamburger menu's dropdown items to the right.
- **Decision:** Preserve the existing right-side hamburger control and right-align the collapsed navigation links and call-to-action within the dropdown.
- **Shipped:** Updated the mobile navigation layout to align items and link text at the right edge.

## 2026-10-29 — Restore consistent mobile navigation alignment

- **Asked:** Revert the right alignment on the homepage menu and check design consistency across pages.
- **Decision:** Match the homepage's collapsed navigation to the left-aligned item treatment used on the supporting pages, keeping the hamburger control itself on the right.
- **Shipped:** Reverted the homepage-only right alignment and compared the mobile navigation structure across the homepage and all six supporting pages; the dropdown items now share the same left-aligned reading direction.
- **History note:** The preceding mobile-menu alignment was requested and shipped before this follow-up; this correction is recorded separately to preserve the append-only history.

## 2026-10-29 — Add icon-led engagement footer contacts

- **Asked:** Show an assistant/person icon beside “Headquarters Secretariat” and an email icon beside “Email Us” in the Engage page footer.
- **Decision:** Use Lucide person and mail icons with clear labels and separate contact-detail lines. Keep the headquarters address and email connected to the existing admin-managed contact data and inquiry fallback.
- **Shipped:** Reworked the Engage footer's Engagement column into two responsive icon-led contact rows; configured email links to open a mail composer when a verified address is entered in admin.

## 2026-10-29 — Organize site files and verify links

- **Asked:** Structure the website files and make sure the links work correctly.
- **Decision:** Keep the public entry point at the repository root and move the six supporting pages plus the admin preview into `pages/`; group all logos, icons and the favicon under `assets/images/`; keep shared CSS and JavaScript in `css/` and `js/`; and update relative paths to match. Make the shared contact fallback resolve correctly from both the root landing page and nested pages, then document the layout and add a repeatable link checker.
- **Shipped:** Moved `about`, `what-we-do`, `c-mink`, `insights`, `people`, `engage` and `admin` into `pages/`; moved all image assets and `favicon.svg` into `assets/images/`; rewrote stylesheet, script, image, favicon and page links across the site; updated `js/site-data.js` to resolve the inquiry fallback from either folder depth; added `README.md` and `tools/check-links.mjs`; verified 275 internal links and anchors, and confirmed all pages and shared assets return HTTP 200 from a local server.
- **Note:** Existing public page URLs such as `/about.html` now resolve at `/pages/about.html`; no redirect stubs were added. The footer LinkedIn URL remains a generic placeholder pending RAFA's verified profile.

## 2026-10-29 — Publish website to requested GitHub repository

- **Asked:** Push the current RAFA website project to `EngKumiLarbi/RAFA`.
- **Decision:** Verify the destination and link integrity, then commit the staged website work and push the `main` branch to the explicitly requested repository, without changing the existing `origin` remote.
- **Shipped:** Confirmed the destination has no existing branch refs and the internal link checker passes; prepared the project for its first push to the requested repository.
- **Publish result:** Pushed commit `194b698` to `EngKumiLarbi/RAFA` on `main`; append-only project history updated with the confirmed outcome.
