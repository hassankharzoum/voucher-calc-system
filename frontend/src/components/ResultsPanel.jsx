import { fmt } from "@/lib/calc";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const ResultRow = ({ cell, label, labelEn, value, unit, testId, highlight }) => (
  <div
    data-testid={testId}
    className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-md ${highlight ? "bg-[#F0EFEA]" : ""}`}
  >
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#182620] leading-tight">
        {label} <span className="font-mono text-[10px] text-[#C89F65] align-top">{cell}</span>
      </p>
      <p className="text-xs text-[#57665E]">{labelEn}</p>
    </div>
    <p className={`font-mono font-semibold whitespace-nowrap ${highlight ? "text-lg" : "text-base"}`}>
      {value} <span className="text-xs text-[#57665E] font-normal">{unit}</span>
    </p>
  </div>
);

export const ResultsPanel = ({ results, d17 }) => {
  if (!results || results.error) {
    return (
      <div className="bg-white rounded-lg border border-[#D6D3CA] shadow-sm p-6">
        <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C89F65]">Sonuçlar / Results</p>
        <p data-testid="results-empty-state" className="text-sm text-[#57665E] mt-4">
          {results?.error === "rate_required"
            ? "Hesaplama için dolar kurunu girin / Enter the exchange rate to calculate"
            : "Hesaplama için sipariş fişi tutarını girin / Enter the voucher amount to calculate"}
        </p>
      </div>
    );
  }

  const ok = results.valid;
  return (
    <div className="bg-white rounded-lg border border-[#D6D3CA] shadow-sm p-6 space-y-4">
      <div className="pb-3 border-b border-[#D6D3CA] flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C89F65]">Sonuçlar / Results</p>
          <h2 className="text-xl font-bold mt-1">Hesaplama / Calculation</h2>
        </div>
        <div
          data-testid="validation-indicator"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            ok ? "bg-[#3A6E55]/10 text-[#3A6E55]" : "bg-[#B84A3B]/10 text-[#B84A3B]"
          }`}
        >
          {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {ok ? "Doğrulandı / Valid" : "Hata / Mismatch"}
        </div>
      </div>

      <div className="space-y-0.5">
        <ResultRow cell="D19" label="Fatura Olması Gereken Tutar" labelEn="Required Invoice Amount" value={fmt(results.d19)} unit="TL" testId="result-d19" />
        <ResultRow cell="D23" label="Ödenen Tutar (Nakit)" labelEn="Cash Paid by Hand" value={fmt(results.d23)} unit="USD" testId="result-d23" highlight />
        <ResultRow cell="D25" label="Havale Tutarı" labelEn="Bank Transfer Amount" value={fmt(results.d25)} unit="TL" testId="result-d25" highlight />
        <ResultRow cell="D27" label="Toplam (Doğrulama)" labelEn={`Validation Total — must equal D17 (${fmt(d17)})`} value={fmt(results.d27)} unit="USD" testId="result-d27" highlight />
      </div>

      <div className="pt-3 border-t border-dashed border-[#D6D3CA]">
        <p className="text-xs tracking-[0.18em] uppercase font-semibold text-[#57665E] mb-1 px-3">KDV / Tax</p>
        <div className="space-y-0.5">
          <ResultRow cell="I19" label="KDV Tutarı (Olması Gereken)" labelEn="Tax on Required Invoice" value={fmt(results.i19)} unit="TL" testId="result-i19" />
          <ResultRow cell="I21" label="KDV Tutarı (Fatura)" labelEn="Tax on Actual Invoice" value={fmt(results.i21)} unit="TL" testId="result-i21" />
          <ResultRow cell="I23" label="KDV Farkı" labelEn="Tax Difference" value={fmt(results.i23)} unit="TL" testId="result-i23" />
          <ResultRow cell="I25" label="KDV Farkı" labelEn="Tax Difference" value={fmt(results.i25)} unit="USD" testId="result-i25" />
        </div>
      </div>
    </div>
  );
};
