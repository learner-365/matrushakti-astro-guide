# Matrushakti Astro Guide

A responsive Vedic Janma Kundli generator with server-side D1 calculations, three SVG chart layouts, and a print / PDF report.

## Run locally

Requirements: Node.js 20.9 or newer and pnpm 10 or newer. The Swiss Ephemeris Node binding includes a Windows x64 N-API build; deployments need a supported Node.js platform and architecture.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Chart generation needs an internet connection for the Open-Meteo Geocoding lookup. `.env.example` contains the optional provider key variable.

## What is implemented

- Four-step, Unicode-friendly birth-details form with exact, approximate and unknown time states.
- Searchable international place selection with displayed coordinates, administrative areas and IANA time zone.
- Server-side local civil time conversion with historical IANA rules; invalid and ambiguous daylight-saving times return an error.
- Swiss Ephemeris Moshier calculations for the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn and selected Mean or True lunar node; Ketu is opposite Rahu.
- Lahiri / Chitrapaksha sidereal positions, Ascendant, Whole Sign D1 houses, Rashis, Nakshatras, Padas, Nakshatra lords and retrograde flags.
- North Indian fixed-house diamond, East Indian fixed-sign square/cross, and South Indian fixed-sign grid SVG renderers. They consume the same calculation result.
- Birth summary, planetary table, Hindi/Odia planet and Rashi labels, A4 print layout and two-page PDF export.
- About, Privacy and Terms pages; in-process request throttles; no user accounts or database.

## Project structure

```text
src/app/                 Next.js pages, styling and API routes
src/components/          Kundli SVG renderer
src/lib/                 Calculation, timezone, geocoding and chart mapping
docs/                    Methodology, layout and deployment notes
```

## Check the project

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

Tests cover sign/Nakshatra boundary handling, historical and DST time conversion, D1 house assignments, all three chart mappings, and a Swiss Ephemeris runtime smoke case. They do **not** certify numerical accuracy against an independent ephemeris reference. See [Calculation methodology](docs/METHODOLOGY.md).

## Important release limits

- The engine explicitly uses Swiss Ephemeris Moshier mode. It does not include the separate `.se1` Swiss Ephemeris files or file-backed `SWIEPH` mode.
- No independently verified reference chart set or numerical tolerance report is included. Complete that work before claiming release-grade accuracy.
- Only D1 is implemented. D2–D60, Vimshottari Dasha, Bhava Chalit, aspects, yogas, doshas and astrological interpretations are omitted.
- The non-commercial Open-Meteo Geocoding endpoint is used by default. Commercial deployment requires the provider's commercial subscription and customer endpoint.
- Hindi and Odia currently translate planet and Rashi labels. The rest of the interface remains English.
- In-process throttling is for a single server process. Use a shared store at scale.

See [deployment notes](docs/DEPLOYMENT.md) and [known limitations](docs/METHODOLOGY.md#known-limitations) before publishing.

