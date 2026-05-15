# TODO

- [x] Fix mobile sidebar/nav behavior across all pages
  - [x] Make `setupMobileNavigation()` idempotent (no early-return preventing attachment)
  - [x] Ensure only one `.nav-overlay` exists and only one toggle handler runs
  - [x] Close nav on resize/orientationchange and on nav link click

- [x] Fix API docs mobile layout
  - [x] Ensure injected copy button (`.api-copy-button`) is positioned/stacked correctly on mobile

- [ ] Run quick sanity check by opening: /privacy.html, /terms.html, /api-docs.html, /text.html on mobile viewport widths
