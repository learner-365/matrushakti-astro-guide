
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateChart } from "@/lib/calculate";
import { searchBirthPlaces } from "@/lib/geocoder";
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, Globe2, LoaderCircle, MapPin, Menu, MoonStar, Printer, ShieldCheck, Sparkles, Star, Sun, X } from "lucide-react";
import { ChartResult, formatDMS, RASHIS, RASHI_ENGLISH } from "@/lib/astro";
import { BirthPlace } from "@/lib/geocoder";
import { ChartStyle, chartStyleLabels, KundliChart } from "@/components/KundliChart";

type Accuracy = "exact" | "approximate" | "unknown";
type NodeMode = "mean" | "true";

function Logo() {
  return <a className="brand" href="#top" aria-label="Matrushakti Astro Guide home">
    <span className="brand-mark" aria-hidden="true"><span>✳</span></span>
    <span><strong>MATRUSHAKTI</strong><small>ASTRO GUIDE</small></span>
  </a>;
}

function LayoutPreview({ style }: { style: ChartStyle }) {
  return <div className={`layout-preview preview-${style}`} aria-hidden="true">
    {style === "north" ? <svg viewBox="0 0 100 100"><rect x="1" y="1" width="98" height="98"/><path d="M0 0L100 100M100 0L0 100M50 0L100 50L50 100L0 50Z"/></svg> :
      style === "south" ? <svg viewBox="0 0 100 100"><rect x="1" y="1" width="98" height="98"/><path d="M25 0V100M75 0V100M0 25H100M0 75H100M50 0V25M50 75V100M0 50H25M75 50H100"/></svg> :
        <svg viewBox="0 0 100 100"><rect x="1" y="1" width="98" height="98"/><path d="M33 0V100M67 0V100M0 33H100M0 67H100M0 0L33 33M67 0L100 33M0 67L33 100M67 67L100 100"/></svg>}
  </div>;
}

function PDFPage({ children }: { children: React.ReactNode }) {
  return <div className="pdf-page">{children}</div>;
}

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [accuracy, setAccuracy] = useState<Accuracy>("exact");
  const [countryQuery, setCountryQuery] = useState("India");
  const [stateQuery, setStateQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<BirthPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<BirthPlace | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placeNotice, setPlaceNotice] = useState("");
  const [nodeMode, setNodeMode] = useState<NodeMode>("mean");
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [style, setStyle] = useState<ChartStyle>("north");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (placeQuery.trim().length < 2 || selectedPlace?.name === placeQuery.trim()) {
      setPlaces([]);
      setPlaceLoading(false);
      setPlaceNotice("");
      return;
    }
    const controller = new AbortController();
    setPlaceLoading(true);
    setPlaceError("");
    setPlaceNotice("");
    const timer = window.setTimeout(async () => {
      try {
        // The provider accepts a location plus one country qualifier. Match
        // optional state and district details against returned place data.
        const query = [placeQuery.trim(), countryQuery.trim()].filter(Boolean).join(", ");
        const places = await searchBirthPlaces(query, "en", controller.signal);
        const sameArea = (actual: string, requested: string) => !requested.trim() || actual.toLocaleLowerCase().includes(requested.trim().toLocaleLowerCase());
        const countryMatches = places.filter((place: BirthPlace) =>
          sameArea(place.country, countryQuery) || place.countryCode.toLocaleLowerCase() === countryQuery.trim().toLocaleLowerCase()
        );
        let candidates = countryMatches;
        let relaxedAreaMatch = false;
        if (stateQuery.trim()) {
          const stateMatches = candidates.filter((place: BirthPlace) => sameArea(place.state, stateQuery));
          if (stateMatches.length) candidates = stateMatches;
          else relaxedAreaMatch = true;
        }
        if (districtQuery.trim() && (!stateQuery.trim() || !relaxedAreaMatch)) {
          const districtMatches = candidates.filter((place: BirthPlace) => sameArea(place.district, districtQuery));
          if (districtMatches.length) candidates = districtMatches;
          else relaxedAreaMatch = true;
        }
        setPlaces(candidates.slice(0, 10));
        if (relaxedAreaMatch && candidates.length) {
          setPlaceNotice("No exact state or district match was found. Check the region shown on each result before selecting.");
        }
      } catch (error) {
        if (!controller.signal.aborted) setPlaceError(error instanceof Error ? error.message : "Place search failed.");
      } finally {
        if (!controller.signal.aborted) setPlaceLoading(false);
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [placeQuery, countryQuery, stateQuery, districtQuery, selectedPlace]);

  const birthLocationLine = useMemo(() => {
    if (!chart) return "";
    return [chart.birth.locationName, chart.birth.district, chart.birth.state, chart.birth.country].filter(Boolean).join(", ");
  }, [chart]);

  function nextStep() {
    setFormError("");
    if (step === 1 && !name.trim()) { setFormError("Please enter your full name."); return; }
    if (step === 2) {
      if (!birthDate) { setFormError("Please choose a date of birth."); return; }
      if (accuracy !== "unknown" && !birthTime) { setFormError("Please enter a local birth time or mark it as unknown."); return; }
    }
    if (step === 3 && !countryQuery.trim()) { setFormError("Enter the country of birth."); return; }
    if (step === 3 && !selectedPlace) { setFormError("Select the exact birthplace from the search results."); return; }
    setStep(Math.min(step + 1, 4));
  }

  async function generateChart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!name.trim() || !birthDate || !birthTime || !selectedPlace || accuracy === "unknown") {
      setFormError(accuracy === "unknown" ? "A known birth time is required for Lagna and house calculations." : "Complete your name, date, time and selected birthplace first.");
      return;
    }
    setBusy(true);
    try {
      const result = await calculateChart({ name: name.trim(), birthDate, birthTime, timeAccuracy: accuracy as "exact" | "approximate", placeId: selectedPlace.id, nodeMode }, selectedPlace);
      setChart(result);
      setStyle("north");
      window.setTimeout(() => document.getElementById("kundli-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't calculate this chart. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadReport() {
    if (!chart) return;
    setPdfBusy(true);
    try {
      await document.fonts.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const reportPages = Array.from(document.querySelectorAll<HTMLElement>(".pdf-page"));
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let index = 0; index < reportPages.length; index += 1) {
        const canvas = await html2canvas(reportPages[index], { scale: 2, backgroundColor: "#ffffff", useCORS: false, logging: false });
        if (index > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }
      const fileName = chart.birth.name.replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-|-$/g, "") || "janma-kundli";
      pdf.save(`${fileName}-janma-kundli.pdf`);
    } catch (error) {
      setFormError(error instanceof Error ? `PDF export failed: ${error.message}` : "PDF export failed. Use Print / Save as PDF instead.");
    } finally {
      setPdfBusy(false);
    }
  }

  function printReport() { window.print(); }

  const [today, setToday] = useState("");
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);
  const localizedPlanets: Record<string, Record<string, string>> = {
    Hindi: { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" },
    Odia: { Sun: "ସୂର୍ଯ୍ୟ", Moon: "ଚନ୍ଦ୍ର", Mars: "ମଙ୍ଗଳ", Mercury: "ବୁଧ", Jupiter: "ଗୁରୁ", Venus: "ଶୁକ୍ର", Saturn: "ଶନି", Rahu: "ରାହୁ", Ketu: "କେତୁ" },
  };
  const localizedRashis: Record<string, string[]> = {
    Hindi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    Odia: ["ମେଷ", "ବୃଷ", "ମିଥୁନ", "କର୍କଟ", "ସିଂହ", "କନ୍ୟା", "ତୁଳା", "ବିଛା", "ଧନୁ", "ମକର", "କୁମ୍ଭ", "ମୀନ"],
  };

  return <main id="top">
    <header className="site-header">
      <div className="header-inner"><Logo />
        <button className="mobile-menu" onClick={() => setNavOpen(!navOpen)} aria-label={navOpen ? "Close navigation" : "Open navigation"}>{navOpen ? <X /> : <Menu />}</button>
        <nav className={navOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          <a href="#generator" onClick={() => setNavOpen(false)}>Generate Kundli</a><a href="#styles" onClick={() => setNavOpen(false)}>Chart styles</a><a href="#how-it-works" onClick={() => setNavOpen(false)}>How it works</a><Link href="/about">About</Link>
        </nav>
        <a className="header-cta" href="#generator">Start your chart <ArrowRight size={15} /></a>
      </div>
    </header>

    <section className="hero-section">
      <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-orbit orbit-three"/>
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"/> VEDIC ASTROLOGY, MADE CLEAR</div>
          <h1>Discover your<br/><em>birth chart.</em></h1>
          <p className="hero-description">Generate your Vedic Janma Kundli from your birth details. Explore your Lagna, Rashis, Nakshatras and planetary positions in three traditional chart styles.</p>
          <div className="hero-actions"><a href="#generator" className="button button-gold">Generate my Kundli <ArrowRight size={16}/></a><a href="#styles" className="text-link">Explore chart styles <ArrowDown size={15}/></a></div>
          <div className="trust-row"><span><ShieldCheck size={15}/> Your details are not saved</span><span><Sparkles size={15}/> Transparent settings</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="mandala-ring ring-outer"/><div className="mandala-ring ring-inner"/><div className="mandala-center"><span className="mandala-star">✳</span><span className="mandala-label">JYOTISH</span><span className="mandala-sub">LIGHT · TIME · PLACE</span></div>
          <span className="orbit-dot dot-one"/><span className="orbit-dot dot-two"/><span className="orbit-dot dot-three"/><span className="orbit-dot dot-four"/>
          <span className="planet-mark mark-one">☉</span><span className="planet-mark mark-two">☾</span><span className="planet-mark mark-three">✧</span>
          <div className="art-caption"><span>01 / 12</span><span>THE NATAL SKY</span></div>
        </div>
      </div>
      <div className="hero-bottom"><span>Ancient Wisdom for a Brighter Tomorrow</span><span>Scroll to begin <ArrowDown size={14}/></span></div>
    </section>

    <section className="intro-strip">
      <div className="intro-mark"><MoonStar size={22}/></div>
      <p><strong>A birth chart is a map of the sky at one moment.</strong> Matrushakti brings traditional Jyotish chart formats together with clearly stated astronomical settings.</p>
      <a href="#how-it-works" className="intro-link">Our approach <ArrowRight size={15}/></a>
    </section>

    <section className="generator-section" id="generator">
      <div className="section-heading">
        <div className="eyebrow eyebrow-dark"><span className="eyebrow-line"/> YOUR PERSONAL CHART</div>
        <h2>Begin with your <em>birth details.</em></h2>
        <p>Use the information as recorded at birth. The selected birthplace determines the coordinates and historical time zone.</p>
      </div>
      <div className="generator-shell">
        <aside className="step-rail" aria-label="Form steps">
          <div className="step-rail-brand"><span className="rail-sun">✳</span><span>JANMA<br/>KUNDLI</span></div>
          {["Personal details", "Date & time", "Place of birth", "Preferences"].map((label, index) => {
            const stepNo = index + 1;
            return <button type="button" className={`step-item ${step === stepNo ? "active" : ""} ${stepNo < step ? "complete" : ""}`} key={label} onClick={() => { if (stepNo <= step) { setStep(stepNo); setFormError(""); } }} aria-current={step === stepNo ? "step" : undefined}>
              <span className="step-index">{stepNo < step ? <Check size={14}/> : `0${stepNo}`}</span><span className="step-label">{label}</span>{stepNo < 4 && <span className="step-connector"/>}
            </button>;
          })}
          <div className="rail-note"><ShieldCheck size={16}/><span>Birth details stay in your browser and are used only for this calculation.</span></div>
        </aside>

        <form className="generator-form" onSubmit={generateChart} noValidate>
          <div className="form-topline"><span>STEP {String(step).padStart(2, "0")} <span className="muted">/ 04</span></span><span className="form-secure"><ShieldCheck size={14}/> Private by design</span></div>
          {step === 1 && <div className="form-step" key="step-1">
            <div className="form-step-heading"><span className="step-kicker">01 · PERSONAL INFORMATION</span><h3>What should we call you?</h3><p>Your name appears on your personal report.</p></div>
            <label className="field-label" htmlFor="full-name">Full name <span className="required-mark">*</span></label>
            <input className="text-input" id="full-name" type="text" autoComplete="off" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" />
            <p className="field-hint">Names in any language are welcome.</p>
            <div className="privacy-note"><ShieldCheck size={18}/><span>We calculate your chart without creating an account or saving your personal details.</span></div>
          </div>}

          {step === 2 && <div className="form-step" key="step-2">
            <div className="form-step-heading"><span className="step-kicker">02 · DATE AND TIME OF BIRTH</span><h3>When were you born?</h3><p>Enter local civil time as it was recorded at the place of birth.</p></div>
            <div className="field-grid">
              <div><label className="field-label" htmlFor="birth-date">Date of birth <span className="required-mark">*</span></label><input className="text-input" id="birth-date" type="date" max={today} value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></div>
              <div><label className="field-label" htmlFor="birth-time">Local time of birth <span className="required-mark">*</span></label><div className="input-icon-wrap"><Clock3 size={16}/><input className="text-input time-input" id="birth-time" type="time" step="60" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} disabled={accuracy === "unknown"}/></div><span className="field-hint">24-hour clock, local to birthplace</span></div>
            </div>
            <fieldset className="accuracy-fieldset"><legend>How accurate is the birth time?</legend><div className="choice-row">
              {[{ value: "exact", title: "Exact", detail: "As recorded" }, { value: "approximate", title: "Approximate", detail: "May affect Lagna" }, { value: "unknown", title: "Unknown", detail: "No time available" }].map((option) => <label key={option.value} className={`choice-card ${accuracy === option.value ? "selected" : ""}`}><input type="radio" name="accuracy" value={option.value} checked={accuracy === option.value} onChange={() => setAccuracy(option.value as Accuracy)}/><span className="choice-title">{option.title}</span><span className="choice-detail">{option.detail}</span></label>)}
            </div></fieldset>
            {accuracy === "approximate" && <div className="inline-alert"><Clock3 size={17}/><span>An approximate time can shift the Ascendant and house placements. We will mark it in the chart report.</span></div>}
            {accuracy === "unknown" && <div className="inline-alert alert-warn"><Clock3 size={17}/><span>Without a birth time, Lagna and houses cannot be calculated. We will not substitute midnight or guess a time.</span></div>}
          </div>}

          {step === 3 && <div className="form-step" key="step-3">
            <div className="form-step-heading"><span className="step-kicker">03 · PLACE OF BIRTH</span><h3>Where were you born?</h3><p>Search and choose the exact town or village so we can use its coordinates and time zone.</p></div>
            <div className="field-grid place-admin-grid"><div><label className="field-label" htmlFor="country-query">Country <span className="required-mark">*</span></label><input id="country-query" className="text-input" type="text" value={countryQuery} onChange={(event) => { setCountryQuery(event.target.value); setSelectedPlace(null); }} placeholder="Country name" /></div><div><label className="field-label" htmlFor="state-query">State / region</label><input id="state-query" className="text-input" type="text" value={selectedPlace?.state ?? stateQuery} onChange={(event) => { setStateQuery(event.target.value); setSelectedPlace(null); }} placeholder="State or province" /></div></div>
            <div className="district-field"><label className="field-label" htmlFor="district-query">District / county</label><input id="district-query" className="text-input" type="text" value={selectedPlace?.district ?? districtQuery} onChange={(event) => { setDistrictQuery(event.target.value); setSelectedPlace(null); }} placeholder="District or county, if known" /></div>
            <label className="field-label place-label" htmlFor="place-search">Birth city, town, or village <span className="required-mark">*</span></label>
            <div className="place-search-wrap"><MapPin size={18}/><input id="place-search" className="place-input" value={selectedPlace ? selectedPlace.name : placeQuery} onChange={(event) => { setSelectedPlace(null); setPlaceQuery(event.target.value); }} placeholder="Search a city, town or village" autoComplete="off" aria-autocomplete="list" aria-controls="place-results" aria-expanded={places.length > 0}/>{placeLoading && <LoaderCircle className="spin place-loading" size={18}/>}</div>
            {places.length > 0 && <div className="place-results" id="place-results" role="listbox" aria-label="Matching birth places">{places.map((place) => <button type="button" key={place.id} className="place-result" role="option" aria-selected={false} onClick={() => { setSelectedPlace(place); setPlaceQuery(place.name); setStateQuery(place.state); setDistrictQuery(place.district); setPlaces([]); setPlaceNotice(""); setFormError(""); }}><MapPin size={16}/><span><strong>{place.name}</strong><small>{[place.district, place.state, place.country].filter(Boolean).join(", ")}</small></span><span className="place-result-coords">{place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}</span></button>)}</div>}
            {placeError && <div className="error-inline" role="alert">{placeError}</div>}
            {placeNotice && <p className="field-hint" role="status">{placeNotice}</p>}
            {placeQuery.trim().length >= 2 && !placeLoading && !placeError && places.length === 0 && !selectedPlace && <p className="field-hint">No matching location found. Check the spelling and country, then search again.</p>}
            {selectedPlace && <div className="selected-place"><div className="selected-place-heading"><span><Check size={15}/> Selected birthplace</span><button type="button" onClick={() => { setSelectedPlace(null); setPlaceQuery(""); }}>Change</button></div><strong>{[selectedPlace.name, selectedPlace.district, selectedPlace.state, selectedPlace.country].filter(Boolean).join(", ")}</strong><div className="selected-place-meta"><span><MapPin size={14}/> {selectedPlace.latitude.toFixed(5)}°, {selectedPlace.longitude.toFixed(5)}°</span><span><Globe2 size={14}/> {selectedPlace.timezone}</span></div></div>}
            <p className="field-hint provider-note">Place search uses Open-Meteo Geocoding with GeoNames-based results (CC BY 4.0 attribution). Search terms go to the provider; coordinates and time zone come from your selected result.</p>
          </div>}

          {step === 4 && <div className="form-step" key="step-4">
            <div className="form-step-heading"><span className="step-kicker">04 · CALCULATION PREFERENCES</span><h3>Choose your settings.</h3><p>These settings are applied by the calculation engine and shown on your result.</p></div>
            <div className="settings-list">
              <div className="setting-row"><div className="setting-copy"><span className="setting-label">Zodiac</span><span className="setting-detail">Sidereal · Nirayana</span></div><span className="setting-pill">SIDEREAL</span></div>
              <div className="setting-row"><div className="setting-copy"><span className="setting-label">Ayanamsha</span><span className="setting-detail">Lahiri / Chitrapaksha</span></div><span className="setting-pill">LAHIRI</span></div>
              <div className="setting-row"><div className="setting-copy"><span className="setting-label">House model</span><span className="setting-detail">Whole Sign Houses · Parashari D1</span></div><span className="setting-pill">WHOLE SIGN</span></div>
              <label className="setting-row setting-select-row"><span className="setting-copy"><span className="setting-label">Rahu and Ketu</span><span className="setting-detail">Choose lunar node convention</span></span><select className="setting-select" value={nodeMode} onChange={(event) => setNodeMode(event.target.value as NodeMode)}><option value="mean">Mean Node</option><option value="true">True Node</option></select><ChevronDown size={14} className="select-chevron"/></label>
              <label className="setting-row setting-select-row"><span className="setting-copy"><span className="setting-label">Report language</span><span className="setting-detail">Planet and sign names are translated</span></span><select className="setting-select" value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Hindi</option><option>Odia</option></select><ChevronDown size={14} className="select-chevron"/></label>
            </div>
            <div className="inline-alert"><Sun size={17}/><span>Initial release includes D1 Rashi only. Divisional charts, dasha and interpretations will appear after their calculation rules are validated.</span></div>
            {accuracy === "unknown" && <div className="inline-alert alert-warn"><Clock3 size={17}/><span>A known birth time is required for Lagna and houses. Return to step 2 and enter one before generating a chart.</span></div>}
          </div>}

          {formError && <div className="form-error" role="alert">{formError}</div>}
          <div className="form-actions">
            {step > 1 ? <button type="button" className="button button-quiet" onClick={() => { setStep(step - 1); setFormError(""); }}><ChevronLeft size={16}/> Back</button> : <span/>}
            {step < 4 ? <button type="button" className="button button-dark" onClick={nextStep}>Continue <ChevronRight size={16}/></button> : <button type="submit" className="button button-dark generate-button" disabled={busy || accuracy === "unknown" || !selectedPlace}>{busy ? <><LoaderCircle className="spin" size={16}/> Calculating chart…</> : <>Generate my Kundli <ArrowRight size={16}/></>}</button>}
          </div>
          <p className="form-footnote">Calculations use the selected place's IANA time zone, historical rules, and the listed sidereal settings.</p>
        </form>
      </div>
    </section>

    {chart && <section className="results-section" id="kundli-results">
      <div className="results-heading"><div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line"/> YOUR CALCULATED CHART</div><h2>{chart.birth.name}&apos;s <em>Janma Kundli.</em></h2><p>{birthLocationLine} · {chart.birth.birthDate} at {chart.birth.birthTime} local time</p></div><div className="results-actions"><button className="button button-outline" onClick={printReport}><Printer size={16}/> Print</button><button className="button button-gold" onClick={downloadReport} disabled={pdfBusy}>{pdfBusy ? <LoaderCircle className="spin" size={16}/> : <Download size={16}/>} {pdfBusy ? "Preparing PDF…" : "Download report"}</button></div></div>
      {chart.birth.timeAccuracy === "approximate" && <div className="approx-note"><Clock3 size={16}/> Birth time marked approximate; Lagna and houses may shift if the recorded time is inaccurate.</div>}
      <div className="result-grid">
        <div className="chart-card">
          <div className="chart-card-header"><div><span className="chart-kicker">D1 · RASHI CHART</span><h3>Janma Kundli</h3></div><span className="chart-style-tag">{chartStyleLabels[style]}</span></div>
          <div className="style-tabs" role="tablist" aria-label="Chart style">
            {(["north", "east", "south"] as ChartStyle[]).map((chartStyle) => <button key={chartStyle} role="tab" aria-selected={style === chartStyle} className={style === chartStyle ? "style-tab active" : "style-tab"} onClick={() => setStyle(chartStyle)}>{chartStyleLabels[chartStyle]}</button>)}
          </div>
          <div className="kundli-wrap"><KundliChart chart={chart} style={style}/></div>
          <p className="chart-caption">Sign numbers and names are shown separately from house numbers. The chart style changes only the layout.</p>
          <div className="planet-legend">{chart.planets.map((planet) => <span key={planet.name}><b>{planet.symbol}</b> {localizedPlanets[language]?.[planet.name] ?? planet.name}</span>)}</div>
        </div>
        <aside className="summary-card"><div className="summary-card-top"><span className="summary-kicker">BIRTH CHART SUMMARY</span><span className="summary-seal"><Star size={17}/></span></div><h3>{chart.birth.name}</h3><p className="summary-location"><MapPin size={14}/>{birthLocationLine}</p>
          <div className="summary-highlight"><span className="summary-highlight-label">LAGNA · ASCENDANT</span><strong>{localizedRashis[language]?.[chart.ascendant.rashiIndex] ?? chart.ascendant.rashi}</strong><small>{formatDMS(chart.ascendant.longitude)} sidereal</small></div>
          <div className="summary-lines">
            <div><span>Date of birth</span><b>{chart.birth.birthDate}</b></div><div><span>Local birth time</span><b>{chart.birth.birthTime}{chart.birth.timeAccuracy === "approximate" ? " · Approx." : ""}</b></div>
            <div><span>Coordinates</span><b>{chart.birth.latitude.toFixed(5)}°, {chart.birth.longitude.toFixed(5)}°</b></div><div><span>Time zone</span><b>{chart.birth.timezone}</b></div>
            <div><span>Chandra Rashi</span><b>{localizedRashis[language]?.[chart.planets.find((p) => p.name === "Moon")!.rashiIndex] ?? chart.planets.find((p) => p.name === "Moon")!.rashi}</b></div><div><span>Surya Rashi</span><b>{localizedRashis[language]?.[chart.planets.find((p) => p.name === "Sun")!.rashiIndex] ?? chart.planets.find((p) => p.name === "Sun")!.rashi}</b></div>
            <div><span>Janma Nakshatra</span><b>{chart.planets.find((p) => p.name === "Moon")!.nakshatra} · Pada {chart.planets.find((p) => p.name === "Moon")!.pada}</b></div>
          </div>
          <div className="settings-summary"><span>CALCULATION SETTINGS</span><p>{chart.settings.zodiac} · {chart.settings.ayanamsha}</p><p>{chart.settings.houseModel} · {chart.settings.nodeMode}</p><p>{chart.settings.ephemeris}</p></div>
          <a href="#planetary-table" className="summary-link">View planetary details <ArrowDown size={14}/></a>
        </aside>
      </div>

      <div className="planetary-section" id="planetary-table"><div className="planetary-heading"><div><span className="chart-kicker">CALCULATED POSITIONS</span><h3>Planetary details</h3></div><span className="table-setting-note">Sidereal longitudes · D1 whole-sign houses</span></div>
        <div className="planet-table-scroll"><table className="planet-table"><thead><tr><th>Planet</th><th>Sidereal longitude</th><th>Rashi</th><th>Degree in Rashi</th><th>House</th><th>Nakshatra</th><th>Pada</th><th>Motion</th></tr></thead><tbody>
          {chart.planets.map((planet) => <tr key={planet.name}><td><span className="planet-name-cell"><span className="table-planet-symbol">{planet.symbol}</span>{localizedPlanets[language]?.[planet.name] ?? planet.name}</span></td><td>{planet.longitude.toFixed(6)}°</td><td><span className="table-sign-number">{planet.rashiIndex + 1}</span>{localizedRashis[language]?.[planet.rashiIndex] ?? planet.rashi}<small className="table-english">{language === "English" ? RASHI_ENGLISH[planet.rashiIndex] : ""}</small></td><td>{formatDMS(planet.degreeInRashi)}</td><td>{planet.house}</td><td>{planet.nakshatra}<small className="table-english">{planet.nakshatraLord} lord</small></td><td>{planet.pada}</td><td><span className={planet.retrograde ? "motion retrograde" : "motion"}>{planet.retrograde ? "Retrograde" : "Direct"}</span></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="methodology-note"><ShieldCheck size={18}/><div><strong>Calculation methodology</strong><p>Swiss Ephemeris Moshier engine · Lahiri / Chitrapaksha sidereal zodiac · {chart.settings.nodeMode.toLowerCase()} · Whole Sign houses. Local birth time converted with the selected IANA time zone. Calculated {new Date(chart.calculatedAt).toLocaleString()}.</p></div><details><summary>Read limits</summary><p>This report contains calculated astronomical positions and traditional chart labels. It does not provide predictions or a scientific assessment of individual outcomes. Moshier ephemeris mode does not use separate Swiss Ephemeris data files; see the documentation before production use.</p></details></div>
      <div className="results-next"><span><Sparkles size={18}/> Your chart is calculated. Switching layouts keeps every placement the same.</span><button className="text-link" onClick={() => { setChart(null); setStep(1); setName(""); setBirthDate(""); setBirthTime(""); setSelectedPlace(null); setPlaceQuery(""); setStateQuery(""); setDistrictQuery(""); window.scrollTo({ top: document.getElementById("generator")?.offsetTop ?? 0, behavior: "smooth" }); }}>Create another chart <ArrowRight size={15}/></button></div>

      <div className="pdf-report-root" aria-hidden="true">
        <PDFPage>
          <div className="pdf-report-header"><span className="pdf-brand-mark">✳</span><div><strong>MATRUSHAKTI ASTRO GUIDE</strong><small>ANCIENT WISDOM FOR A BRIGHTER TOMORROW</small></div><span className="pdf-page-label">JANMA KUNDLI REPORT · 01</span></div>
          <div className="pdf-title"><span>PERSONAL BIRTH CHART</span><h1>{chart.birth.name}</h1><p>{birthLocationLine} &nbsp;·&nbsp; {chart.birth.birthDate} at {chart.birth.birthTime} local time</p></div>
          <div className="pdf-meta-grid"><div><span>LAGNA</span><b>{chart.ascendant.rashi}</b></div><div><span>CHANDRA RASHI</span><b>{chart.planets.find((p) => p.name === "Moon")!.rashi}</b></div><div><span>JANMA NAKSHATRA</span><b>{chart.planets.find((p) => p.name === "Moon")!.nakshatra} · Pada {chart.planets.find((p) => p.name === "Moon")!.pada}</b></div><div><span>TIME ZONE</span><b>{chart.birth.timezone}</b></div></div>
          <div className="pdf-chart-holder"><KundliChart chart={chart} style={style}/></div>
          <div className="pdf-settings"><strong>CALCULATION SETTINGS</strong><span>{chart.settings.zodiac} · {chart.settings.ayanamsha} · {chart.settings.nodeMode} · {chart.settings.houseModel}</span><span>{chart.settings.ephemeris} · {chart.birth.timeAccuracy} birth time</span></div>
          <div className="pdf-footer"><span>MATRUSHAKTI ASTRO GUIDE</span><span>Generated {new Date().toLocaleDateString()} · D1 Rashi chart</span></div>
        </PDFPage>
        <PDFPage>
          <div className="pdf-report-header"><span className="pdf-brand-mark">✳</span><div><strong>MATRUSHAKTI ASTRO GUIDE</strong><small>PLANETARY POSITIONS</small></div><span className="pdf-page-label">JANMA KUNDLI REPORT · 02</span></div>
          <div className="pdf-title pdf-title-compact"><span>SIDEREAL PLANETARY POSITIONS</span><h1>{chart.birth.name}</h1><p>{chart.birth.birthDate} · {chart.birth.birthTime} · {birthLocationLine}</p></div>
          <table className="pdf-table"><thead><tr><th>Planet</th><th>Longitude</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Pada</th><th>Motion</th></tr></thead><tbody>{chart.planets.map((planet) => <tr key={planet.name}><td><b>{planet.symbol}</b> {localizedPlanets[language]?.[planet.name] ?? planet.name}</td><td>{planet.longitude.toFixed(4)}°</td><td>{planet.rashiIndex + 1} · {localizedRashis[language]?.[planet.rashiIndex] ?? planet.rashi}</td><td>{formatDMS(planet.degreeInRashi)}</td><td>{planet.house}</td><td>{planet.nakshatra}</td><td>{planet.pada}</td><td>{planet.retrograde ? "Retrograde" : "Direct"}</td></tr>)}</tbody></table>
          <div className="pdf-birth-details"><strong>BIRTH DETAILS</strong><div><span>Name</span><b>{chart.birth.name}</b></div><div><span>Birthplace</span><b>{birthLocationLine}</b></div><div><span>Coordinates</span><b>{chart.birth.latitude.toFixed(5)}°, {chart.birth.longitude.toFixed(5)}°</b></div><div><span>Local birth time</span><b>{chart.birth.birthDate} {chart.birth.birthTime} ({chart.birth.timezone})</b></div></div>
          <div className="pdf-method"><strong>CALCULATION METHODOLOGY & DISCLAIMER</strong><p>Positions calculated using Swiss Ephemeris Moshier mode, Lahiri / Chitrapaksha sidereal zodiac and {chart.settings.nodeMode.toLowerCase()}. Whole Sign Houses are assigned from the sidereal Ascendant. Local birth time was converted using the place's IANA time-zone rules. This report presents calculations and traditional Jyotish labels. Astrology is a traditional interpretive system, not a scientifically established method of predicting individual outcomes. No dasha, divisional chart or interpretation is included in this release.</p></div>
          <div className="pdf-footer"><span>MATRUSHAKTI ASTRO GUIDE</span><span>Generated {new Date().toLocaleDateString()} · Page 2</span></div>
        </PDFPage>
      </div>
    </section>}

    <section className="styles-section" id="styles"><div className="styles-inner">
      <div className="styles-copy"><div className="eyebrow eyebrow-dark"><span className="eyebrow-line"/> THREE CLASSIC FORMATS</div><h2>One chart.<br/><em>Three traditions.</em></h2><p>Each format presents the same calculated placements through a regional chart convention. Choose the one that feels familiar to you.</p><a href="#generator" className="button button-outline">Create a chart <ArrowRight size={15}/></a></div>
      <div className="style-cards">
        {([{ style: "north" as ChartStyle, no: "01", name: "North Indian", description: "Fixed houses · diamond format" }, { style: "east" as ChartStyle, no: "02", name: "East Indian", description: "Fixed Rashis · Bengali template" }, { style: "south" as ChartStyle, no: "03", name: "South Indian", description: "Fixed Rashis · square grid" }]).map((item) => <article className="style-preview-card" key={item.style}><div className="preview-topline"><span>{item.no} / 03</span><span>LAYOUT PREVIEW</span></div><LayoutPreview style={item.style}/><h3>{item.name}</h3><p>{item.description}</p></article>)}
      </div>
      <p className="styles-footnote">These are format previews only. They contain no sample planetary positions. Your chart placements appear after calculation.</p>
    </div></section>

    <section className="features-section"><div className="section-heading"><div className="eyebrow"><span className="eyebrow-line"/> MADE WITH CLARITY</div><h2>Tradition, with the <em>details in view.</em></h2><p>Every result identifies its inputs and calculation convention.</p></div>
      <div className="feature-grid"><article><span className="feature-icon"><Globe2 size={20}/></span><h3>Place-aware time</h3><p>Choose a matched location with coordinates and an IANA time zone. Local time is converted using historical time-zone rules.</p></article><article><span className="feature-icon"><Sun size={20}/></span><h3>Clear settings</h3><p>See the sidereal zodiac, Lahiri ayanamsha, node mode, house model and ephemeris used for each chart.</p></article><article><span className="feature-icon"><ShieldCheck size={20}/></span><h3>Private by default</h3><p>No account or database is required. Birth details are used for the calculation and not saved by this starter application.</p></article><article><span className="feature-icon"><Download size={20}/></span><h3>Ready to keep</h3><p>Download a two-page report or print an A4-friendly version with your chart and planetary table.</p></article></div>
    </section>

    <section className="how-section" id="how-it-works"><div className="how-inner"><div className="how-heading"><div className="eyebrow"><span className="eyebrow-line"/> SIMPLE, STEP BY STEP</div><h2>From birth details<br/>to <em>Janma Kundli.</em></h2></div><div className="how-steps"><article><span>01</span><div><h3>Enter birth details</h3><p>Provide the recorded date and local time. Mark approximate time clearly.</p></div></article><article><span>02</span><div><h3>Select the birthplace</h3><p>Choose the matching town or village and verify its coordinates and time zone.</p></div></article><article><span>03</span><div><h3>Review your settings</h3><p>Choose Mean or True Node. The D1 chart uses Lahiri and Whole Sign Houses.</p></div></article><article><span>04</span><div><h3>Read or print your chart</h3><p>Switch between all three visual formats without recalculating positions.</p></div></article></div></div></section>

    <section className="faq-section"><div className="faq-heading"><div className="eyebrow eyebrow-dark"><span className="eyebrow-line"/> A FEW CLARIFICATIONS</div><h2>Good to <em>know.</em></h2></div><div className="faq-list">
      <details><summary>Does changing the chart style change my placements?<ChevronDown size={17}/></summary><p>No. North, East and South Indian styles are different visual arrangements of the same calculated D1 chart data.</p></details>
      <details><summary>What if my birth time is approximate or unknown?<ChevronDown size={17}/></summary><p>An approximate time is marked on your report because Lagna and houses may shift. If the time is unknown, this version will not guess midnight or produce an Ascendant.</p></details>
      <details><summary>What does “Lahiri” mean here?<ChevronDown size={17}/></summary><p>Lahiri / Chitrapaksha is the selected ayanamsha used to express planetary positions in the sidereal zodiac. It is shown with the chart settings so the convention is visible.</p></details>
      <details><summary>Are the chart interpretations predictions?<ChevronDown size={17}/></summary><p>This release displays calculated chart facts and traditional labels. It does not make individual predictions. Astrology is a traditional interpretive system, not a scientifically established method for predicting personal outcomes.</p></details>
    </div></section>

    <section className="closing-cta"><div className="closing-star">✳</div><div><span className="eyebrow">YOUR SKY, YOUR STORY</span><h2>Begin with the moment <em>you were born.</em></h2><p>Your birth details are all you need to get started.</p></div><a href="#generator" className="button button-gold">Generate my Kundli <ArrowRight size={16}/></a></section>
    <footer className="site-footer"><div className="footer-top"><Logo/><p>Traditional Jyotish chart formats, with calculation settings in view.</p><nav aria-label="Footer navigation"><a href="/about">About</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms & disclaimer</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Matrushakti Astro Guide</span><span>Ancient Wisdom for a Brighter Tomorrow</span><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}

