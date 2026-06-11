import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, User, DollarSign, Info, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";

const Field = ({ label, help, badge, badgeColor, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 flex-wrap">
      <Label className="text-sm font-semibold text-[#182620]">{label}</Label>
      {badge && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
      )}
    </div>
    {children}
    {help && (
      <p className="text-xs text-[#57665E] flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C89F65]" />
        {help}
      </p>
    )}
  </div>
);

const SectionTitle = ({ icon: Icon, step, title, help }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-[#D6D3CA]">
    <div className="w-9 h-9 rounded-lg bg-[#284236] flex items-center justify-center shrink-0">
      <Icon className="w-4.5 h-4.5 text-[#C89F65]" size={18} />
    </div>
    <div>
      <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#C89F65]">{step}</p>
      <h2 className="text-lg font-bold leading-tight">{title}</h2>
      {help && <p className="text-xs text-[#57665E] mt-0.5">{help}</p>}
    </div>
  </div>
);

export const VoucherForm = ({ form, setForm, onSave, saving, rateRequired }) => {
  const { t } = useLang();
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const inputCls =
    "bg-white border-[#D6D3CA] text-base focus-visible:ring-[#284236]/30 focus-visible:border-[#284236]";
  const numCls = `${inputCls} font-mono num`;
  const missingRate = rateRequired && !(Number(form.i17) > 0);

  return (
    <div className="space-y-6">
      {/* Step 1: Customer info */}
      <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-6 space-y-5">
        <SectionTitle icon={User} step="1" title={t("customer_info")} help={t("customer_info_help")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("company_name")}>
            <Input data-testid="input-company-name" className={inputCls} value={form.company_name} onChange={set("company_name")} />
          </Field>
          <Field label={t("customer_code")}>
            <Input data-testid="input-customer-code" className={inputCls} value={form.customer_code} onChange={set("customer_code")} />
          </Field>
          <Field label={t("invoice_no")}>
            <Input data-testid="input-invoice-no" className={inputCls} value={form.invoice_no} onChange={set("invoice_no")} />
          </Field>
          <Field label={t("date")}>
            <Input data-testid="input-voucher-date" type="date" className={`${inputCls} num`} value={form.voucher_date} onChange={set("voucher_date")} />
          </Field>
        </div>
      </div>

      {/* Step 2: Amounts */}
      <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm p-6 space-y-5">
        <SectionTitle icon={DollarSign} step="2" title={t("amounts")} help={t("amounts_help")} />

        <Field
          label={t("voucher_amount")}
          help={t("voucher_amount_help")}
          badge={t("required")}
          badgeColor="bg-[#284236]/10 text-[#284236]"
        >
          <Input data-testid="input-d17" type="number" min="0" step="any" className={`${numCls} text-lg font-semibold h-12`} value={form.d17} onChange={set("d17")} placeholder="0.00" />
        </Field>

        <Field
          label={t("invoice_amount")}
          help={t("invoice_amount_help")}
          badge={t("optional")}
          badgeColor="bg-[#F0EFEA] text-[#57665E]"
        >
          <Input data-testid="input-d21" type="number" min="0" step="any" className={numCls} value={form.d21} onChange={set("d21")} placeholder="0.00" />
        </Field>

        <Field
          label={t("exchange_rate")}
          help={rateRequired ? t("exchange_rate_required_help") : t("exchange_rate_optional_help")}
          badge={rateRequired ? t("required") : t("optional")}
          badgeColor={rateRequired ? "bg-[#CC8A3A]/15 text-[#CC8A3A]" : "bg-[#F0EFEA] text-[#57665E]"}
        >
          <Input data-testid="input-i17" type="number" min="0" step="any" className={`${numCls} ${missingRate ? "border-[#B84A3B] ring-1 ring-[#B84A3B]/30" : ""}`} value={form.i17} onChange={set("i17")} placeholder="0.00" />
          {missingRate && (
            <p data-testid="rate-required-warning" className="text-xs text-[#B84A3B] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {t("rate_warning")}
            </p>
          )}
        </Field>

        <Button
          data-testid="save-voucher-btn"
          onClick={onSave}
          disabled={saving || !(Number(form.d17) > 0) || missingRate}
          className="w-full bg-[#284236] hover:bg-[#1E3329] text-white font-semibold text-base py-6 rounded-lg active:scale-[0.98] transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? t("saving") : t("save_voucher")}
        </Button>
      </div>
    </div>
  );
};
