---
applyTo: "**"
---
# CropET — FAO-56 Penman-Monteith Evapotranspiration

## Domain
- Reference evapotranspiration (ETo) calculation per FAO Irrigation & Drainage Paper 56
- Solar radiation estimation from sunshine hours and latitude
- Psychrometric calculations (vapor pressure, slope of VP curve)
- Daily and monthly ETo computation

## Key Equations (FAO-56 — public domain, UN FAO)
- Penman-Monteith ETo: `(0.408Δ(Rn-G) + γ(900/(T+273))u₂(es-ea)) / (Δ + γ(1+0.34u₂))`
- Saturation VP: `e°(T) = 0.6108 × exp(17.27T/(T+237.3))`
- Slope of VP curve: `Δ = 4098 × e°(T) / (T+237.3)²`
- Psychrometric constant: `γ = 0.665e-3 × P`
- Extraterrestrial radiation: function of latitude and Julian day

## Validation Sources
- FAO-56 Paper 56, Examples 1-18 (definitive reference)
- CROPWAT output comparison
- FAO CLIMWAT database published ETo values



# Code Implementation Flow

<important>Mandatory Development Loop (non-negotiable)</important>

## Git Workflow
- **Work directly on master** — solo developer, no branch overhead
- **Commit after every completed unit of work** — never leave working code uncommitted
- **Push after each work session** — remote backup is non-negotiable
- **Tag milestones**: `git tag v0.1.0-mvp` when deploying or reaching a checkpoint
- **Branch only for risky experiments** you might discard — delete after merge or abandon

## Preparation & Definitions
- Use Typescript as default language, unless told otherwise
- Work using TDD with red/green flow ALWAYS
- If its a webapp: Add always Playwright E2E tests
- Separate domain logic from CLI/UI/WebAPI, unless told otherwise
- Every UI/WebAPI feature should have parity with a CLI way of testing that feature

## Validation
After completing any feature:
- Run all new unit tests, validate coverage is over 90%
- Use cli to test new feature
- If its a UI impacting feature: run all e2e tests
- If its a UI impacting feature: do a visual validation using Playwright MCP, take screenshots as you tests and review the screenshots to verify visually all e2e flows and the new feature. <important>If Playwright MCP is not available stop and let the user know</important>

If any of the validations step fail, fix the underlying issue.

## Finishing
- Update documentation for the project based on changes
- <important>Always commit after you finish your work with a message that explain both what is done, the context and a trail of the though process you made </important>


# Deployment

- git push master branch will trigger CI/CD in Github
- CI/CD in Github will run tests, if they pass it will be deployed to Vercel https://cropet.vercel.app/
- Umami analytics and Feedback form with Supabase database