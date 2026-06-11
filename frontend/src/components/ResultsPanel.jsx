import { fmt } from "@/lib/calc";
import { useLang } from "@/lib/i18n";
import {
  CheckCircle2, AlertTriangle, Banknote, Landmark, FileText, Sigma,
  Calculator, ReceiptText, MinusCircle, ShieldCheck,
} from "lucide-react";

const Num = ({ children, className = "" }) => (
  <span className={`font-mono num font-bold ${className}`}>{children}</span>
);

const BigRow = ({ icon: Icon, label, help, value, unit, tone, testId }) => {
  const tones = {
    gold: "bg-[#C89F65]/10 border-[#C89F65]/40",
    green: "bg-[#3A6E55]/10 border-[#3A6E55]/30",
    neutral: "bg-[#F0EFEA] border-[#D6D3CA]",
  };
  const iconTones = { gold: "text-[#9a7335]", green: "text-[#3A6E55]", neutral: "text-[#57665E]" };
  return (
    <div data-testid={testId} className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${tones[tone]}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`w-5 h-5 shrink-0 ${iconTones[tone]}`} />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">{label}</p>
          <p className="text-xs text-[#57665E]">{help}</p>
        </div>
      </div>
      <p className="whitespace-nowrap text-end">
        <Num className="text-xl sm:text-2xl">{value}</Num>{" "}
        <span className="text-xs text-[#57665E] font-semibold">{unit}</span>
      </p>
    </div>
  );
};

const SmallRow = ({ label, value, unit, testId, strong }) => (
  <div data-testid={testId} className="flex items-center justify-between gap-3 py-2 px-3">
    <p className={`text-sm ${strong ? "font-bold" : "font-medium"} text-[#182620]`}>{label}</p>
    <p className="whitespace-nowrap">
      <Num className={strong ? "text-base" : "text-sm font-semibold"}>{value}</Num>{" "}
      <span className="text-xs text-[#57665E]">{unit}</span>
    </p>
  </div>
);

const CardTitle = ({ icon: Icon, title, note }) => (
  <div className="flex items-center gap-2.5 pb-3 border-b border-[#D6D3CA]">
    <Icon className="w-4.5 h-4.5 text-[#C89F65]" size={18} />
    <h3 className="text-base font-bold">{title}</h3>
    {note && <span className="text-[11px] text-[#57665E] italic">· {note}</span>}
  </div>
);

export const ResultsPanel = ({ results, d17 }) => {
  const { t } = useLang();

  if (!results || results.error) {
    return (
      <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-8 text-center">
        <Calculator className="w-10 h-10 mx-auto text-[#D6D3CA] mb-3" />
        <p data-testid="results-empty-state" className="text-base text-[#57665E] font-medium">
          {results?.error === "rate_required" ? t("enter_rate_prompt") : t("enter_amount_prompt")}
        </p>
      </div>
    );
  }

  const deduction = results.i25 > 0;
  const ok = results.valid;

  return (
    <div className="space-y-5">
      {/* Deduction status banner */}
      <div
        data-testid="deduction-status"
        className={`rounded-xl border-2 p-4 flex items-start gap-3 ${
          deduction ? "bg-[#CC8A3A]/10 border-[#CC8A3A]" : "bg-[#3A6E55]/10 border-[#3A6E55]"
        }`}
      >
        {deduction ? (
          <MinusCircle className="w-6 h-6 text-[#CC8A3A] shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-[#3A6E55] shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-base font-extrabold ${deduction ? "text-[#a56a22]" : "text-[#3A6E55]"}`}>
            {deduction ? t("deduction_required") : t("no_deduction")}
          </p>
          <p className="text-sm text-[#57665E] mt-0.5">{deduction ? t("deduction_msg") : t("no_deduction_msg")}</p>
          {deduction && (
            <p className="mt-1.5">
              <Num className="text-xl text-[#a56a22]">{fmt(results.i25)}</Num>{" "}
              <span className="text-xs font-bold text-[#a56a22]">USD</span>
            </p>
          )}
        </div>
      </div>

      {/* Payment plan */}
      <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D6D3CA]">
          <div className="flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-[#C89F65]" />
            <h2 className="text-lg font-bold">{t("payment_plan")}</h2>
          </div>
          <div
            data-testid="validation-indicator"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              ok ? "bg-[#3A6E55]/10 text-[#3A6E55]" : "bg-[#B84A3B]/10 text-[#B84A3B]"
            }`}
          >
            {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {ok ? t("verified") : t("mismatch")}
          </div>
        </div>

        <div className="space-y-3">
          {/* Cash payment breakdown */}
          <div data-testid="cash-breakdown" className={`rounded-lg border-2 overflow-hidden ${deduction ? "border-[#CC8A3A]/60" : "border-[#3A6E55]/50"}`}>
            <div className={`px-4 py-2.5 text-xs font-bold flex items-start gap-2 ${deduction ? "bg-[#CC8A3A]/15 text-[#a56a22]" : "bg-[#3A6E55]/10 text-[#3A6E55]"}`}>
              {deduction ? <MinusCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />}
              <span data-testid="cash-status-message">{deduction ? t("cash_deduction_msg") : t("cash_no_deduction_msg")}</span>
            </div>
            <div className="p-4 bg-[#C89F65]/5 space-y-1">
              <div data-testid="cash-before-deduction" className="flex items-center justify-between gap-3 py-1.5">
                <p className="text-sm font-medium text-[#182620]">{t("cash_before_deduction")}</p>
                <p className="whitespace-nowrap"><Num className="text-base">{fmt(results.cashBefore)}</Num> <span className="text-xs text-[#57665E]">USD</span></p>
              </div>
              <div data-testid="cash-kdv-deduction" className={`flex items-center justify-between gap-3 py-1.5 ${deduction ? "text-[#a56a22]" : "text-[#57665E]"}`}>
                <p className="text-sm font-medium">{t("kdv_deduction")}</p>
                <p className="whitespace-nowrap"><Num className="text-base">{deduction ? `− ${fmt(results.i25)}` : "0"}</Num> <span className="text-xs">USD</span></p>
              </div>
              <div className={`border-t-2 border-dashed my-1.5 ${deduction ? "border-[#CC8A3A]/40" : "border-[#3A6E55]/30"}`} />
              <div data-testid="result-d23" className="flex items-center justify-between gap-3 rounded-lg bg-[#3A6E55]/10 border border-[#3A6E55]/30 px-3 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Banknote className="w-5 h-5 shrink-0 text-[#3A6E55]" />
                  <p className="text-sm font-extrabold text-[#2c523f] leading-tight">{t("final_cash_label")}</p>
                </div>
                <p className="whitespace-nowrap"><Num className="text-2xl text-[#2c523f]">{fmt(results.d23)}</Num> <span className="text-xs font-bold text-[#3A6E55]">USD</span></p>
              </div>
            </div>
          </div>

          <BigRow icon={Landmark} label={t("bank_transfer")} help={t("bank_transfer_help")} value={fmt(results.d25)} unit="TRY" tone="neutral" testId="result-d25" />
          <BigRow icon={Sigma} label={t("total")} help={t("total_help")} value={fmt(results.d27)} unit="USD" tone="green" testId="result-d27" />
        </div>

        <SmallRow label={`${t("required_invoice")} — ${t("required_invoice_help")}`} value={fmt(results.d19)} unit="TRY" testId="result-d19" />
      </div>

      {/* Invoice breakdown */}
      {results.invoice && (
        <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-6 space-y-2" data-testid="invoice-breakdown">
          <CardTitle icon={ReceiptText} title={t("invoice_breakdown")} note={t("invoice_note")} />
          <div className="divide-y divide-dashed divide-[#D6D3CA]">
            <SmallRow label={t("before_kdv")} value={fmt(results.invoice.before)} unit="TRY" testId="invoice-before-kdv" />
            <SmallRow label={t("kdv_amount_lbl")} value={fmt(results.invoice.kdv)} unit="TRY" testId="invoice-kdv-amount" />
            <SmallRow label={t("after_kdv")} value={fmt(results.invoice.after)} unit="TRY" testId="invoice-after-kdv" strong />
            <SmallRow label={t("invoice_total_usd")} value={fmt(results.invoice.totalUsd)} unit="USD" testId="invoice-total-usd" strong />
          </div>
        </div>
      )}

      {/* KDV analysis */}
      <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-6 space-y-2">
        <CardTitle icon={FileText} title={t("kdv_analysis")} />
        <div className="divide-y divide-dashed divide-[#D6D3CA]">
          <SmallRow label={t("tax_required")} value={fmt(results.i19)} unit="TRY" testId="result-i19" />
          <SmallRow label={t("tax_actual")} value={fmt(results.i21)} unit="TRY" testId="result-i21" />
          <SmallRow label={t("tax_diff_tl")} value={fmt(results.i23)} unit="TRY" testId="result-i23" />
          <SmallRow label={t("tax_diff_usd")} value={fmt(results.i25)} unit="USD" testId="result-i25" strong />
        </div>
      </div>
    </div>
  );
};
