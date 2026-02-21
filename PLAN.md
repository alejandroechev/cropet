# CropET — FAO-56 Penman-Monteith Evapotranspiration

## Mission
Replace CROPWAT (1990s Windows tool that crashes on modern systems) with a working web-based ETo calculator.

## Architecture
- `packages/engine/` — FAO-56 Penman-Monteith equation, solar radiation estimation, climate data processing
- `packages/web/` — React + Vite, climate data entry, ETo time series chart
- `packages/cli/` — Node runner for batch ETo computation

## MVP Features (Free Tier)
1. Input daily or monthly climate data (Tmax, Tmin, RH, wind, sunshine hours)
2. Compute daily reference ETo using FAO-56 Penman-Monteith equation
3. Display daily ETo chart across a growing season
4. Export ETo time series as CSV

## Engine Tasks

### E1: Climate Data Parser
- Parse daily climate records: Date, Tmax, Tmin, RH_mean, Wind (m/s), Sunshine (hrs)
- Handle missing values (interpolation or flag)
- Unit conversion helpers (°F→°C, mph→m/s)
- **Validation**: FAO-56 Example 18

### E2: Solar Radiation Estimation
- Extraterrestrial radiation Ra from latitude + day of year
- Solar radiation Rs from sunshine hours: `Rs = (a + b × n/N) × Ra`
- Net shortwave: `Rns = (1 - albedo) × Rs`
- Net longwave: `Rnl = σ × ((Tmax⁴+Tmin⁴)/2) × (0.34 - 0.14√ea) × (1.35Rs/Rso - 0.35)`
- Net radiation: `Rn = Rns - Rnl`
- **Validation**: FAO-56 Examples 8-14

### E3: Psychrometric & Vapor Pressure
- Saturation VP: `e°(T) = 0.6108 × exp(17.27T/(T+237.3))`
- Actual VP from RH: `ea = es × RH/100`
- Slope: `Δ = 4098 × e°(T) / (T+237.3)²`
- Psychrometric constant: `γ = 0.665e-3 × P`
- **Validation**: FAO-56 Table 2.3, Examples 3-7

### E4: FAO-56 Penman-Monteith ETo
- `ETo = (0.408Δ(Rn-G) + γ(900/(T+273))u₂(es-ea)) / (Δ + γ(1+0.34u₂))`
- **Validation**: FAO-56 Example 18 (complete worked example)

### E5: Export
- Daily ETo table, monthly summary, CSV export

## Key Equations (FAO-56 — public domain, UN FAO)
- PM ETo: `(0.408Δ(Rn-G) + γ(900/(T+273))u₂(es-ea)) / (Δ + γ(1+0.34u₂))`
- Sat VP: `e°(T) = 0.6108 × exp(17.27T/(T+237.3))`

## Validation: FAO-56 Paper 56, Examples 1-18
