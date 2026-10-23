# Gedidun

**Repo:** `darshabloom/gedidun` — currently private.

## Structure
- `/index.html`: intentionally neutral public landing page.
- `/marina-os/`: Marina OS home-screen entry point.
- `/marina-os/app.html`: dashboard that requests the user's Google OAuth consent and fetches a private Google Sheets registry. It does not bundle personal tasks or credentials.
- `/marina-os/manifest.webmanifest`: home-screen metadata.

## Access control
A hidden path is **not authentication**. If GitHub Pages is public, anyone can see its interface and JavaScript; **only a Google account with access to Marina's private spreadsheet can read or modify her records**. The OAuth client ID is public, never add a client secret or token to the repository. GitHub Pages cannot prevent a stranger from reaching the HTML route. To prevent even that, choose a hosting service with mandatory sign-in or an access gateway.

## To enable
1. Choose whether to keep the repository private and use a qualifying paid GitHub Pages plan, **or explicitly approve making it public**. Do not publish private data in repository files.
2. GitHub repository **Settings → Pages**: deploy from `main` root. Check that the page becomes available. Pages is not enabled by committing files alone.
3. Google Cloud: enable Sheets API, configure OAuth consent for Marina's account, create a **Web application** OAuth client with authorised JavaScript origin `https://darshabloom.github.io`. Do not place a client secret in the static site.
4. Sign into Marina OS using Marina's Google account, supply the public OAuth client ID and registry spreadsheet ID in the connection form. Only that Google account (or another explicitly authorised Sheet collaborator) can access Sheets data.
5. Test a read of all 26 projects and then a *deliberate P001 test action* status change. Verify the exact source row and audit in Sheets. Do not test on live P014 Posidelki commitments.
6. On Marina's iPhone, visit the **actual live** `https://darshabloom.github.io/gedidun/marina-os/` address in Safari, then Share → Add to Home Screen. That URL is not confirmed active until Pages deployment is verified.

## Limitations
Google OAuth and real source writeback have not yet been live-tested; the current frontend uses row-oriented checked updates but cannot make a concurrent Google Sheet row move transactional. The home-screen shortcut doesn't add privacy. Sessions use temporary in-memory access tokens and may require Google reauthorisation.
