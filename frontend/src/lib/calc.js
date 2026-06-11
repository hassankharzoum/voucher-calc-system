// Mirrors MUHASEBE.xlsx formulas exactly (same as backend compute())
export function calculateVoucher({ d17, i17, d21, kdvRate, divisor }) {
  d17 = Number(d17) || 0;
  i17 = Number(i17) || 0;
  d21 = Number(d21) || 0;
  kdvRate = Number(kdvRate);
  divisor = Number(divisor);
  if (d17 <= 0) return null;
  if (d21 > 0 && i17 <= 0) return { error: "rate_required" };

  if (i17 > 0) {
    const d19 = (d17 / divisor) * i17;          // =D17/divisor*I17
    const i19 = (d19 * kdvRate) / 100;          // =D19*kdv%
    const i21 = (d21 * kdvRate) / 100;          // =D21*kdv%
    const i23 = i19 - i21;                      // =I19-I21
    const i25 = i23 / i17 > 0 ? i23 / i17 : 0;  // =IF(I23/I17>0,I23/I17,0)
    const d25 = d21;                            // =D21
    const d23 = d17 - d25 / i17 - i25;          // =D17-(D25/I17)-I25
    const d27 = d23 + d25 / i17 + i25;          // =D23+D25/I17+I25
    // Invoice breakdown (display only): entered amount is before KDV.
    // USD total uses the BEFORE-KDV amount (= D25/I17), exactly as the Excel
    // payment flow does in D23/D27. After-KDV is informational only.
    const invoice =
      d21 > 0
        ? {
            before: d21,
            kdv: i21,
            after: d21 + i21,
            totalUsd: d21 / i17,
          }
        : null;
    return { d19, i19, i21, i23, i25, d23, d25, d27, invoice, valid: Math.abs(d27 - d17) < 1e-6 };
  }

  // No rate & D21 = 0: USD results derived algebraically, TL fields unavailable
  const i25 = ((d17 / divisor) * kdvRate) / 100;
  const d23 = d17 - i25;
  return { d19: null, i19: null, i21: 0, i23: null, i25, d23, d25: 0, d27: d17, invoice: null, valid: true };
}

export function fmt(n, digits = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
