# CropET — Business Plan

## Product Summary

**CropET** is a browser-based reference evapotranspiration (ETo) calculator implementing the FAO-56 Penman-Monteith equation — the international standard for irrigation water management. It replaces the legacy CROPWAT desktop tool (1990s-era, crashes on modern Windows) and expensive alternatives like REF-ET with a clean, modern web experience.

**Domain:** Agricultural water management, irrigation engineering, agronomy research, consulting hydrology.

**Target users:** Irrigation engineers, agricultural consultants, extension agents, agronomy researchers, farm managers, water resource planners.

**Deployed at:** cropet.app (Vercel free tier)

---

## Current State Assessment

### Test Coverage
| Category | Count | Notes |
|----------|-------|-------|
| Unit tests | 0 | No isolated unit tests for individual functions |
| E2E tests | 26 | Integration tests across engine modules |
| **Total** | **26** | Engine test files: climate, eto, export, psychrometric, radiation |

### ⚠️ CRITICAL BLOCKER: ~12% Validation Gap
The PM equation computes but deviates ~12% from FAO-56 reference values. **This must be resolved before any commercial use.** Likely causes:
- Incorrect intermediate calculation (net longwave radiation formula is complex)
- Unit conversion error in psychrometric constant or vapor pressure
- Soil heat flux (G) handling for monthly vs daily timesteps
- Solar radiation estimation coefficients (Angstrom a/b values)

**Resolution plan:** Implement unit tests for each FAO-56 worked example (Examples 1–18) to isolate which sub-calculation diverges. Fix root cause, then validate end-to-end ETo within ±1% of published values.

### Market Validation Scores
| Metric | Score | Interpretation |
|--------|-------|----------------|
| Professional Use | 55% | Moderate — irrigation pros need more features (Kc, scheduling) |
| Scales to Paid | 45% | Below average — ETo alone is commodity; needs crop-specific features |
| Useful at MVP | 70% | Good — basic ETo calculator serves quick-check use case |
| Incremental Premium | 50% | Moderate — some willingness to pay for convenience over free tools |
| Major Premium | 70% | Good — full irrigation scheduling suite commands premium pricing |

### Competitive Landscape
| Competitor | Price | Platform | Strengths | Weaknesses |
|-----------|-------|----------|-----------|------------|
| CROPWAT | Free | Desktop (Win) | FAO official, crop Kc database | 1990s UI, crashes on Win10/11, no updates |
| REF-ET | ~$200/yr | Desktop (Win) | Multiple ET methods, ASCE support | Desktop-only, expensive for students |
| CropWaterUse | Free | Web | Simple, accessible | Limited features, no export |
| **CropET** | **Free** | **Web** | **Modern UI, daily/monthly ETo, CSV export** | **ETo only, no Kc, 12% validation gap** |

### Current Strengths
- Browser-based — no install, works on any device
- Daily and monthly ETo computation
- Clean, modern UI with interactive charts
- CSV import/export
- Unit conversion (°F↔°C, mph↔m/s)
- Pure TypeScript engine — testable, portable

### Current Weaknesses
- ⚠️ ~12% validation gap vs FAO-56 reference values (BLOCKER)
- Zero unit tests (only E2E)
- Reference ET only — no crop coefficients (Kc)
- No irrigation scheduling
- No weather station data integration
- No soil water balance

---

## Monetization Strategy

### Phase 1 — Free (MVP Fix + Foundation)
**Goal:** Fix validation, establish credibility, build user base.

**Timeline:** 4–6 weeks

| Task | Size | Priority | Description |
|------|------|----------|-------------|
| Fix 12% validation gap | L | P0 — BLOCKER | Unit test each FAO-56 example (1–18), isolate divergence, fix root cause. Target ±1% of published values. |
| Unit test suite | M | P0 | Individual tests for every sub-calculation: saturation VP, slope Δ, psychrometric γ, Ra, Rs, Rns, Rnl, Rn, ETo |
| Monthly ETo aggregation fix | S | P1 | Verify monthly soil heat flux (G ≠ 0 for monthly) |
| Altitude/pressure input | S | P1 | Allow user to specify elevation for psychrometric constant |
| Example data presets | S | P2 | Load FAO-56 Example 18 data with one click for demo |

**Free features (permanent):**
- Daily/monthly ETo calculation (FAO-56 Penman-Monteith)
- Solar radiation estimation from sunshine hours
- CSV import/export
- Interactive ETo time-series chart
- Unit conversion

### Phase 2 — Pro Tier ($79–149/yr)
**Goal:** Crop-specific features that convert irrigation professionals into paying users.

**Timeline:** 3–4 months after Phase 1

| Feature | Size | Description |
|---------|------|-------------|
| Crop coefficient (Kc) database | L | FAO-56 Table 12 Kc values for 100+ crops. Initial/mid/end stage Kc with growth stage duration. Compute ETc = Kc × ETo. |
| Irrigation scheduling | L | Soil water balance model. Daily depletion tracking, trigger irrigation at MAD (management allowable depletion). Generate schedule with dates, depths, volumes. |
| Weather station API integration | L | Import data from public weather APIs (Open-Meteo, NOAA GHCN). Auto-fill climate inputs from nearest station by lat/lon. |
| Soil water balance | L | FAO-56 dual crop coefficient approach. Root zone depletion, deep percolation, runoff estimation. Daily soil moisture tracking. |
| PDF reports | M | Professional irrigation report: ETo summary, ETc by crop, irrigation schedule, water budget. Print-ready with @media print styles. |
| Multi-season analysis | M | Store and compare ETo across multiple growing seasons. Trend visualization. |
| Custom crop profiles | S | User-defined Kc curves for specialty crops not in FAO-56 database. |

**Pricing rationale:** CROPWAT is free but broken on modern systems. REF-ET is ~$200 but desktop-only. CropET Pro at $79–149/yr undercuts REF-ET while adding crop scheduling that neither competitor offers in a browser.

### Phase 3 — Enterprise Tier ($199–349/yr)
**Goal:** Real-time data integration and precision agriculture features for commercial farms and consultancies.

**Timeline:** 6–12 months after Phase 2

| Feature | Size | Description |
|---------|------|-------------|
| Real-time satellite/weather data | XL | Integration with satellite-based ET products (OpenET, MODIS). Real-time weather data feeds for automated daily ETo updates. |
| Field mapping | XL | GIS-lite field boundary drawing. Per-field ETo/ETc computation. Multi-field irrigation management dashboard. |
| Deficit irrigation optimization | L | Regulated deficit irrigation (RDI) strategies. Optimize water savings vs yield impact by growth stage. |
| Yield prediction models | XL | Empirical yield-ET relationships (FAO-33 yield response factor Ky). Forecast yield impact of water stress. |
| API access | M | REST API for ETo/ETc computation. Integration with farm management software and SCADA systems. |
| Team/organization accounts | M | Shared projects, role-based access, consultant multi-client management. |

---

## Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 500 | 2,000 | 5,000 |
| Pro subscribers | 20 | 100 | 300 |
| Enterprise subscribers | 0 | 10 | 40 |
| Pro ARPU | $99 | $119 | $129 |
| Enterprise ARPU | — | $249 | $279 |
| **ARR** | **$1,980** | **$14,390** | **$49,860** |

---

## Go-to-Market Strategy

### Target Segments (Priority Order)
1. **Irrigation consultants** — bill clients for water management plans, need professional reports
2. **Extension agents** — advise farmers on irrigation scheduling, need accessible tools
3. **Agronomy researchers** — compute ETo for field trials, publish with reference data
4. **Farm managers** — large commercial operations with multiple fields and crops
5. **Civil/water engineering students** — learning FAO-56 methodology

### Acquisition Channels
- **SEO:** Target "ETo calculator online", "Penman-Monteith calculator", "CROPWAT alternative", "FAO-56 calculator"
- **Academic citations:** Get referenced in irrigation textbooks and university course materials
- **FAO/extension networks:** Promote through agricultural extension service newsletters
- **Conference demos:** ASABE, ICID, irrigation district meetings
- **Content marketing:** Tutorial blog posts on ETo computation, irrigation scheduling best practices

### Conversion Strategy
- Free tier validates against FAO-56 → builds trust
- Kc database + irrigation scheduling → clear upgrade path for professionals
- PDF reports → consultants need deliverables for clients
- "Compare to CROPWAT" landing page targeting frustrated legacy users

---

## Technical Roadmap

### Immediate (Phase 1 — Weeks 1–6)
```
Week 1-2: Unit tests for FAO-56 Examples 1-18
  ├── Psychrometric: Examples 3-7 (saturation VP, slope, γ)
  ├── Radiation: Examples 8-14 (Ra, Rs, Rns, Rnl, Rn)
  └── Full ETo: Example 18 (complete worked example)

Week 3-4: Fix validation gap
  ├── Isolate which sub-calculation diverges
  ├── Fix root cause (likely radiation or VP calculation)
  └── Achieve ±1% match on all 18 examples

Week 5-6: Polish
  ├── Monthly G ≠ 0 handling
  ├── Altitude input for pressure
  └── Example data presets
```

### Medium-term (Phase 2 — Months 3–6)
```
Month 3: Kc database + ETc computation
Month 4: Soil water balance model
Month 5: Irrigation scheduling + weather API
Month 6: PDF reports + multi-season
```

### Long-term (Phase 3 — Months 7–12)
```
Month 7-8: Field mapping + GIS features
Month 9-10: Satellite/weather data integration
Month 11-12: Yield prediction + deficit irrigation
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Validation gap unfixable | Fatal | Low | FAO-56 examples are well-documented; systematic unit testing will isolate the issue |
| CROPWAT gets modernized by FAO | High | Low | FAO has not updated CROPWAT since 2009; institutional inertia is strong |
| Free alternatives improve | Medium | Medium | Differentiate with Kc database + scheduling + reports (features, not just ETo) |
| Weather API costs at scale | Medium | Medium | Use free-tier APIs (Open-Meteo), cache aggressively, pass costs to Enterprise |
| Slow adoption in agriculture sector | Medium | High | Long sales cycles in ag; focus on consultants who adopt faster than farmers |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | FAO-56 validation accuracy | ±1% on all 18 examples |
| Phase 1 | Unit test coverage | >90% engine functions |
| Phase 1 | Monthly active users | 100 |
| Phase 2 | Pro conversion rate | 4–6% of free users |
| Phase 2 | NPS score | >50 |
| Phase 3 | Enterprise subscribers | 40+ |
| Phase 3 | ARR | $50K+ |
