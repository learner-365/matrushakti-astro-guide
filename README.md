# Matrushakti Astro Guide

A responsive, open-source Vedic Janma Kundli generator with browser-side Moshier calculations, three SVG chart layouts and a print / PDF report.

## GitHub Pages

The project site URL for the current repository is:

https://learner-365.github.io/matrushakti-astro-guide/

The GitHub Actions workflow builds a static export and deploys it when changes are pushed to main. Chart calculation runs in the visitor's browser using the AGPL-3.0 @swisseph/browser WebAssembly package. Place search calls the Open-Meteo Geocoding API directly. The free geocoder is for non-commercial use.

## Run locally

Requirements: Node.js 20.9 or newer and pnpm 10 or newer.

    pnpm install
    pnpm dev

Open http://localhost:3000. No environment variables or backend server are required.

## What is implemented

- Four-step birth-details form with exact and approximate time states.
- Searchable international place selection with coordinates, administrative areas and IANA time zone.
- Browser-side local civil time conversion with historical IANA rules; invalid and ambiguous daylight-saving times return an error.
- Swiss Ephemeris Moshier calculations for the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn and selected Mean or True lunar node; Ketu is opposite Rahu.
- Lahiri / Chitrapaksha sidereal positions, Ascendant, Whole Sign D1 houses, Rashis, Nakshatras, Padas, Nakshatra lords and retrograde flags.
- North Indian fixed-house diamond, East Indian fixed-sign square/cross, and South Indian fixed-sign grid SVG renderers.
- Birth summary, planetary table, Hindi/Odia labels, A4 print layout and two-page PDF export.
- About, Privacy and Terms pages; no user accounts, database or chart persistence.

## Project structure

- src/app/ — Next.js pages and styling.
- src/components/ — Kundli SVG renderer.
- src/lib/ — Calculation, timezone, geocoding and chart mapping.
- docs/ — Methodology, layout and deployment notes.

## Licensing

This combined application is released under AGPL-3.0-only. The browser calculation package is also AGPL-3.0. See LICENSE and docs/DEPLOYMENT.md before redistributing or operating a modified service.
