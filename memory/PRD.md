# PRD — Tahsilat Makbuzu / Payment Voucher System

## Original Problem Statement
Analyze MUHASEBE.xlsx and build an accounting system replicating its formulas exactly.
Inputs: D17 main voucher amount (USD, required), D21 actual invoice amount (TL, optional), I17 USD→TRY rate (required only if D21 > 0).
Outputs: D19 required invoice (TL), D23 cash by hand (USD), D25 bank transfer (TL), D27 validation total (= D17), plus KDV: I19, I21, I23 (TL), I25 (USD).

## Excel Formulas (canonical, verified against sheet)
- D19 = D17 / divisor × I17 (divisor default 2)
- I19 = D19 × kdv% (kdv default 10)
- I21 = D21 × kdv%
- I23 = I19 − I21
- I25 = IF(I23/I17 > 0, I23/I17, 0)
- D25 = D21
- D23 = D17 − (D25/I17) − I25
- D27 = D23 + D25/I17 + I25 (must equal D17)
- If D21 = 0 and no rate: USD results derived algebraically (I25 = D17/divisor×kdv%, D23 = D17 − I25, D27 = D17); TL fields shown as "—".
- Canonical sample: d17=2000, i17=46, d21=32000 → d19=46000, i19=4600, i21=3200, i23=1400, i25=30.434782608..., d23=1273.913043478..., d27=2000 ✓

## User Choices
- Bilingual UI (Turkish + English)
- Vouchers saved to MongoDB with history list
- Printable A4 receipt view mimicking the Excel layout
- KDV rate & invoice divisor adjustable via Settings

## Architecture
- FastAPI backend (/app/backend/server.py): /api/calculate, /api/vouchers CRUD, /api/settings (GET/PUT, stored in Mongo `settings` collection key=global)
- React frontend: VoucherDashboard (form + live results + history), PrintVoucher (/print/:id), SettingsDialog
- Shared calc logic: backend compute() + frontend /src/lib/calc.js (mirrored)
- Design: Organic & Earthy light theme (#284236 green, #C89F65 gold), Manrope/IBM Plex Sans/JetBrains Mono

## Implemented (June 10, 2026)
- [x] Full Excel formula engine (backend + frontend mirror), verified to exact decimals
- [x] Conditional rate requirement (I17 only required if D21 > 0) with inline warning + disabled save
- [x] Live calculation panel with D27 validation indicator (green/red)
- [x] Voucher save / history table / delete
- [x] Print view with window.print() and print CSS (@media print)
- [x] Settings dialog (KDV %, divisor) persisted in DB
- [x] Testing: iteration_1 — backend 100%, frontend 100%

## Implemented (June 11, 2026) — UI/UX Overhaul
- [x] Full i18n: English / Turkish / Arabic with header language switcher (localStorage persisted), RTL + IBM Plex Sans Arabic for AR
- [x] Invoice Breakdown card: Amount Before KDV, KDV Amount, Amount After KDV, Invoice Total in USD (calc.js results.invoice)
- [x] Deduction status banner: orange "Deduction Required" (with USD amount) when KDV diff > 0, green "No Deduction Required" otherwise
- [x] Reorganized layout: step cards (1 Customer Info, 2 Amounts) with helper texts and required/optional badges
- [x] All Excel cell references removed from visible UI; user-friendly labels everywhere
- [x] Larger fonts, icons (lucide), LTR tabular numbers (.num class), highlighted payment plan rows
- [x] Testing: iteration_2 — backend 100%, frontend 100%

## Bug Fix (June 11, 2026) — Invoice Total in USD
- Root cause: breakdown card converted the AFTER-KDV amount to USD ((d21+kdv)/rate = 765.22). Excel uses the BEFORE-KDV amount (D25/I17 = d21/rate = 695.65) in D23/D27.
- Fix: calc.js invoice.totalUsd = d21/i17; label clarified to "Invoice Total in USD (before KDV)" in EN/AR/TR.
- Verified: 7-scenario parity script (Excel formulas vs /api/calculate) — all PASS; D27 always equals D17; UI shows 695.65.

## Backlog
- P1: Search/filter and pagination in voucher history
- P1: Edit existing voucher
- P2: Export history to Excel/CSV
- P2: Multi-currency support (EUR rates)
- P2: PDF download (server-side) instead of browser print only

## Test Artifacts
- /app/backend/tests/backend_test.py (12 pytest cases)
- /app/test_reports/iteration_1.json
- No auth; no credentials needed.
