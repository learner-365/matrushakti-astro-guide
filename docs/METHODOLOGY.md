# Calculation methodology

## Engine and settings

The browser loads @swisseph/browser WebAssembly and uses the built-in Moshier ephemeris. The selected ayanamsha is Lahiri / Chitrapaksha. Tropical planetary positions are calculated with Moshier and speed flags, then the Lahiri ayanamsha for the same Julian day is subtracted and longitudes are normalized into the sidereal zodiac.

The entered local date and time are converted to an instant with @js-temporal/polyfill and the selected place's IANA time zone. Local clock times that do not exist or occur twice during daylight-saving transitions are rejected instead of silently choosing one. The resulting UTC instant is converted to Julian Day in Universal Time.

The browser library's house calculation returns a tropical Ascendant; the app subtracts the same Lahiri ayanamsha to obtain the sidereal Ascendant. Whole Sign Houses are selected. The Ascendant Rashi is House 1, and each following sign is the next house. Planetary whole-sign houses are assigned from the sidereal sign index. No Bhava Chalit placements are mixed into the Rashi chart.

Node mode selects Mean Node or True Node. Ketu is derived as Rahu + 180° modulo 360° using the selected node position. Positions retain engine precision in the result; the UI rounds only for display.

Rashi boundaries use floor of normalized sidereal longitude divided by 30°. The 27 Nakshatras and four Padas each use equal angular spans; the boundary value belongs to the following segment. Nakshatra lordship follows the repeating Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury sequence.

## Geography and regional chart layouts

Place search uses Open-Meteo Geocoding. A result includes a GeoNames place ID, latitude, longitude, administrative areas and an IANA time zone. The application requires the user to pick a listed result and shows its coordinates before generation. Provider coverage may still be incomplete.

The North Indian template fixes twelve house regions, starting with House 1 in the top central diamond. Rashi identity follows the Ascendant around those fixed houses. The South Indian template fixes Rashi cells in zodiac order around a square perimeter. The East Indian template fixes Rashis in a 3×3 square/cross layout, splits the four corner cells, and leaves the center empty. Regional chart variants exist; this release documents the selected layout rather than claiming it is universal.

The chart shapes and fixed-sign/house distinction were checked against the user-provided [VedAstro JHora reverse-engineering repository](https://github.com/VedAstro/Natal-Chart-Rasi-Jagannatha-Hora-Reverse-Engineered) and published Jyotish chart-style references. The template definitions are data in src/lib/chart-layout.ts; chart geometry can be corrected without changing the calculation engine.

## Validation status and limitations

This release has not been independently numerically validated against an external reference-chart set. Before making an accuracy claim, create known-answer charts using the same coordinates, historical UTC, Lahiri mode, node convention, ephemeris mode and house model. Record the source/version, expected Ascendant and planetary positions, and allowed tolerances. Include sign and Nakshatra boundary cases. The included test file is not an independent astronomical validation.

Moshier mode is not file-backed Swiss Ephemeris. Verify the intended date range against independent reference charts. Historical timezone rules depend on browser IANA timezone data and may differ across environments. A search result can represent a settlement centroid rather than the exact birth facility. Approximate birth times do not imply rectification. No Dasha, Varga, yoga, dosha, aspect, Bhava Chalit or predictive interpretation is generated.
