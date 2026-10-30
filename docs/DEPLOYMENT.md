# GitHub Pages deployment

## How it works

GitHub Pages serves static files only. This project exports Next.js pages as HTML and runs chart calculations in the visitor's browser with @swisseph/browser WebAssembly. Place searches go directly from the browser to Open-Meteo Geocoding. There is no calculation server, API key, database or account system.

The project site URL for the current repository is https://learner-365.github.io/matrushakti-astro-guide/. A user site at https://kundli.github.io/ would require a repository owned by a GitHub account or organization named kundli.

## Deploy

1. In the GitHub repository, open Settings → Pages and select GitHub Actions as the source if it is not already enabled.
2. Push to the main branch or run the Deploy to GitHub Pages workflow manually.
3. Wait for the workflow to complete, then open the URL above.

The workflow sets NEXT_PUBLIC_BASE_PATH to /matrushakti-astro-guide, runs a static Next.js export, and publishes the generated out folder. To move the project to a different repository name or account, update that workflow variable and this document.

## Geocoding

The default Open-Meteo Geocoding endpoint is intended for non-commercial use. This public browser call does not send a private API key. For commercial operation, choose a provider and integration whose terms fit the service; never put a secret key in a public browser bundle. Place data is based on GeoNames and requires attribution. Review the [official Geocoding API](https://open-meteo.com/en/docs/geocoding-api) and [terms](https://open-meteo.com/en/terms).

## Swiss Ephemeris license

This release uses the AGPL-3.0 route for Swiss Ephemeris and the browser binding. The combined source is published under AGPL-3.0-only. Keep the license and source notices with redistributed copies, and comply with AGPL terms when operating a modified network service. Astrodienst also offers a professional license; no professional license has been obtained for this project.

Moshier mode uses the analytical ephemeris included in the library and does not need external .se1 data files. The project does not silently fall back to file-based Swiss Ephemeris.

## Privacy and accuracy

Chart input is processed in browser memory and is not sent to a calculation API or intentionally stored by the app. Place search terms are sent to Open-Meteo. Hosting and network services can still log ordinary requests; review the provider's current behavior and the Privacy page.

This release has not been independently numerically validated against a reference chart set. Before claiming professional accuracy, compare supported settings and date ranges with authoritative charts and document tolerances. Moshier mode is not the file-based Swiss Ephemeris mode.
