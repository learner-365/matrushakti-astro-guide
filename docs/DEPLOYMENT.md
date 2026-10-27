# Setup and deployment

## Runtime

1. Install Node.js 20.9+ and pnpm 10+.
2. Copy `.env.example` to `.env.local` if configuring the commercial geocoder.
3. Run `pnpm install`, `pnpm test`, `pnpm exec tsc --noEmit`, then `pnpm build`.
4. Deploy as a Next.js Node.js server. Do not deploy calculation routes to an Edge runtime; `sweph` is a native Node N-API binding.
5. Set HTTPS at the platform or reverse proxy. Restrict and rotate provider secrets. Avoid logging API request bodies.

## Geocoding provider

The default host, `geocoding-api.open-meteo.com`, is for evaluation and non-commercial use under Open-Meteo's terms. Place data is based on GeoNames and requires attribution; the app displays the provider/data attribution and explains that searches leave the app.

For commercial use, obtain an appropriate Open-Meteo subscription and set `OPEN_METEO_API_KEY`. The code then uses `customer-geocoding-api.open-meteo.com` and sends the key only from the server. See the [official Geocoding API](https://open-meteo.com/en/docs/geocoding-api), [terms](https://open-meteo.com/en/terms) and [pricing](https://open-meteo.com/en/pricing). Replace the provider adapter if its coverage, retention terms, service level or licensing do not fit the product.

## Swiss Ephemeris licensing and ephemeris files

`sweph` and Swiss Ephemeris use a dual licensing arrangement. This repository is marked AGPL-3.0-only because it uses the AGPL option. If distributing or operating it, comply with AGPL terms for the full combined software, or obtain the Swiss Ephemeris Professional License from Astrodienst and review the binding's licensing conditions with counsel. Do not assume the professional license has been obtained.

This release uses the Moshier calculation flag and requires no external `.se1` files. It does not silently switch to file-backed Swiss Ephemeris. To make a future file-backed mode, first choose a compatible license, obtain legally usable ephemeris data files for the target dates, provide their path through a server-only `SWISSEPH_EPHE_PATH`, select `SEFLG_SWIEPH`, and add explicit checks that the requested dates are covered. Do not put ephemeris files or secrets in browser bundles.

## Scaling and privacy

There is no database, account system, chart persistence or client analytics. Chart inputs exist in the request and response and in the current page state. Review hosting request logs, backups, error reporting, CDN behavior, privacy notices and deletion handling before a public launch.

The in-memory limiter is per process and resets on restart. For multi-instance hosting, move throttling to a shared service and trust forwarded IP headers only from a configured reverse proxy. Add request-body size limits, structured but redacted logs, monitoring and an appropriate timeout for the geocoder.

## Verification still needed before release

- Independent numerical reference charts and documented tolerances for each supported time/setting class.
- PDF review in desktop and mobile browsers, including Unicode names and A4 pagination.
- Visual review on Android/iOS and an accessibility audit.
- Deployment-specific license, privacy, geocoder, security and availability review.

