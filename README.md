# The Morning Tape

A daily newspaper of world markets, stocks, deals, hedge funds and business news, packaged as an installable web app (PWA) for iPhone.

## Install on iPhone
1. Open the site in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.

## How it updates
A scheduled task runs each morning at about 7:36 AM IST. It writes a new edition to `editions/YYYY-MM-DD.json` and adds that edition to the top of `editions/index.json`. GitHub Pages then republishes the site. The app fetches the newest edition whenever it is opened or brought back to the foreground, and keeps saved editions available offline.

## Edition format
`editions/2026-11-09.json` is the reference: `id`, `issue`, `date`, `edition`, `ticker[]`, `tickerNote`, `lead{kicker, headline, deck, body[]}`, `top[]`, `sections[5]{title, items[]{fig, headline, body}}`, `sources[]{title, url}`.

News only. Not investment advice.
