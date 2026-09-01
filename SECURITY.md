# Security Policy

## Scope

This policy covers **Gmail Weather Companion**, a Chrome extension (Manifest
V3). The code in this repository is the whole product — there is no backend
server, database, or hosted API behind it.

Out of scope: the Open-Meteo, RainViewer, and CartoDB services the extension
fetches from, and Chrome itself. Report issues in those to their respective
maintainers.

## Supported Versions

Only the version currently published on the Chrome Web Store receives fixes.
The `main` branch of this repository is what that version is built from. Older
releases are not patched — updates are delivered through the Chrome Web Store,
which upgrades installed users automatically.

## Reporting a Vulnerability

Email **j.allen@jraltdinc.us** with `SECURITY` in the subject line. Please do
not open a GitHub issue for a security report.

Helpful things to include, as far as you have them:

- What the issue is and where in the code it lives
- Steps to reproduce, or a proof of concept
- What an attacker could actually achieve with it

This is a one-person project, so response is best effort rather than
contractual. Expect an acknowledgement within **7 days**, and an assessment of
whether the report is accepted within **30 days**. If a fix is warranted, it
ships as a new version through the Chrome Web Store; you'll be told when it
lands. If a report is declined, you'll get the reasoning rather than silence.

Please give a reasonable window to ship a fix before disclosing publicly.
Credit is offered for accepted reports unless you'd rather stay anonymous.

## What the extension has access to

Useful context when judging the impact of a finding.

The extension declares one permission, `storage`, used to save the selected
location and temperature unit via `chrome.storage.sync`. Its host permissions
cover only the weather and map endpoints it calls: `api.open-meteo.com`,
`geocoding-api.open-meteo.com`, `api.rainviewer.com`, `tilecache.rainviewer.com`,
and `*.basemaps.cartocdn.com`.

A content script runs on `https://mail.google.com/*` to render the sidebar. It
does **not** read the subject or body of any message — the earlier
trip-detection feature that scanned message text was removed. No analytics,
telemetry, or third-party data sharing.

See the [privacy policy](https://jraltdinc.us/gmail-weather-companion-privacy.html)
for the full data-handling description.

## Secrets

This project uses no API keys, tokens, or credentials — Open-Meteo, RainViewer,
and CartoDB all serve the endpoints used here without authentication. Nothing
in this repository should ever contain a secret. If you find something that
looks like one, report it through the process above rather than opening an
issue.
