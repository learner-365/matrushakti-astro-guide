# Calculation methodology

## Engine and settings

The API route runs `sweph` on the Next.js Node.js server. It configures Lahiri / Chitrapaksha with `SE_SIDM_LAHIRI` and calculates geocentric sidereal positions with `SEFLG_MOSEPH | SEFLG_SPEED | SEFLG_SIDEREAL`. This is the Moshier analytical ephemeris included with Swiss Ephemeris; the app does not bundle separate Swiss Ephemeris `.se1` data files.

The UTC instant is calculated from the entered local date/time and the selected place's IANA time zone. `@js-temporal/polyfill` rejects local clock times that do not exist or occur twice during daylight-saving transitions instead of silently choosing one. `sweph.utc_to_jd` returns UT and ET; this chart uses UT for `calc_ut` and the house/Ascendant calculation. No timezone offset is added a second time.

The D1 chart uses the sidereal Ascendant returned by Swiss Ephemeris `houses_ex` with the Whole Sign (`W`) system. The Ascendant Rashi is House 1, and each following sign is the next house. Planetary whole-sign houses are then assigned from the sidereal sign index. No Bhava Chalit placements are mixed into the Rashi chart.

Node mode is an actual engine option: Mean Node uses `SE_MEAN_NODE`, True Node uses `SE_TRUE_NODE`. Ketu is derived as Rahu + 180° modulo 360° using the same selected node position. Positions stay at full engine precision in the result; the UI rounds only while displaying them.

Rashi boundaries use floor of normalized sidereal longitude divided by 30°. The 27 Nakshatras and four Padas each use equal angular spans; the boundary value belongs to the following segment. Nakshatra lordship follows the repeating Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury sequence.

## Geography and regional chart layouts

Place search uses Open-Meteo Geocoding. A result includes a GeoNames location ID, latitude, longitude, administrative areas and an IANA timezone. The chart API re-resolves the selected ID server-side rather than trusting client-supplied coordinates. Provider coverage may still be incomplete; the app requires the user to pick a listed result and shows its coordinates before generation.

The North Indian template fixes twelve house regions, starting with House 1 in the top central diamond. Rashi identity follows the Ascendant around those fixed houses. The South Indian template fixes Rashi cells in zodiac order around a square perimeter. The East Indian template fixes Rashis in a 3×3 square/cross layout, splits the four corner cells, and leaves the center empty. The East template maps Aries to the top side cell, Cancer left, Libra bottom, Capricorn right, then fills the divided corners with the remaining signs. Regional chart variants exist; this release names and documents the selected layout rather than claiming it is universal.

The regional shape and fixed-sign/house distinction were checked against a published Jyotish chart-style comparison and the Bengali/Oriya chart diagram in [Hindu Astrology: An Integrated Approach, pp. 86–87](https://lakshminarayanlenasia.com/articles/Hindu-Astrology-2.pdf). The template definitions are data in `src/lib/chart-layout.ts`; chart geometry can be corrected without changing the calculation engine.

## Reference material and validation status

The user-provided [VedAstro JHora reverse-engineering repository](https://github.com/VedAstro/Natal-Chart-Rasi-Jagannatha-Hora-Reverse-Engineered) is a useful reference for the D1 inputs, Lahiri naming, and cross-check workflow. Its public JavaScript example sends requests to a separate hosted API; it does not provide an in-repository self-contained calculation library. The README also states that feature verification is ongoing. The code uses its documented 16 October 1918 Bangalore sample as a deterministic engine smoke test, not as a known-answer numerical regression.

No external reference result was obtained or recorded for this release. Before making an accuracy claim, create an independent known-answer set using the same coordinates, historical UTC, Lahiri mode, node convention, ephemeris mode and house model. Record the source/version, allowed numerical tolerances, expected Ascendant and all nine planetary positions. Include sign/Nakshatra boundary cases and compare results independently. The existing tests verify internal arithmetic and data flow, not astronomical agreement.

## Known limitations

- Moshier mode is not file-backed Swiss Ephemeris. Verify accuracy for the intended date range against suitable independent reference charts. Ancient dates, future dates and boundary cases need special review.
- Historical timezone data depend on the IANA time-zone database shipped by the Node runtime. Historical local civil times may be uncertain in source records, and time-zone databases can differ across deployment environments.
- A place search result may represent a settlement centroid, not a user's exact home or birth facility. Confirm the chosen location and coordinates.
- No rectification is provided for approximate birth time; chart houses remain a calculation for the entered minute, with an uncertainty note.
- Outer planets are excluded from the classical Navagraha table. No Dasha, Varga, yoga, dosha, aspect, Bhava Chalit or predictive interpretation is generated.
- The PDF captures browser-rendered report pages as images to preserve Unicode names; the chart remains crisp at the selected export scale but the report text is rasterized.

