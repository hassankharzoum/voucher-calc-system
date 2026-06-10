import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const Field = ({ label, labelEn, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold tracking-wide text-[#57665E] uppercase">
      {label} <span className="normal-case font-normal text-[#8a948e]">/ {labelEn}</span>
    </Label>
    {children}
  </div>
);

export const VoucherForm = ({ form, setForm, onSave, saving, rateRequired }) => {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const inputCls =
    "font-mono bg-white border-[#D6D3CA] focus-visible:ring-[#284236]/30 focus-visible:border-[#284236]";

  return (
    <div className="bg-white rounded-lg border border-[#D6D3CA] shadow-sm p-6 space-y-5">
      <div className="pb-3 border-b border-[#D6D3CA]">
        <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C89F65]">Girdiler / Inputs</p>
        <h2 className="text-xl font-bold mt-1">Makbuz Bilgileri / Voucher Details</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Firma Adı" labelEn="Company Name">
          <Input data-testid="input-company-name" className={inputCls} value={form.company_name} onChange={set("company_name")} placeholder="—" />
        </Field>
        <Field label="Müşteri Kodu" labelEn="Customer Code">
          <Input data-testid="input-customer-code" className={inputCls} value={form.customer_code} onChange={set("customer_code")} placeholder="—" />
        </Field>
        <Field label="Fatura No" labelEn="Invoice No">
          <Input data-testid="input-invoice-no" className={inputCls} value={form.invoice_no} onChange={set("invoice_no")} placeholder="—" />
        </Field>
        <Field label="Tarih" labelEn="Date">
          <Input data-testid="input-voucher-date" type="date" className={inputCls} value={form.voucher_date} onChange={set("voucher_date")} />
        </Field>
      </div>

      <div className="h-px bg-[#D6D3CA]" />

      <div className="space-y-4">
        <Field label="Sipariş Fişi Tutarı (D17) · USD" labelEn="Main Voucher Amount · required">
          <Input data-testid="input-d17" type="number" min="0" step="any" className={`${inputCls} text-lg font-semibold`} value={form.d17} onChange={set("d17")} placeholder="0.00" />
        </Field>
        <Field label="Dolar Kuru (I17) · USD→TRY" labelEn={rateRequired ? "Exchange Rate · required" : "Exchange Rate · optional"}>
          <Input data-testid="input-i17" type="number" min="0" step="any" className={`${inputCls} ${rateRequired && !(Number(form.i17) > 0) ? "border-[#B84A3B]" : ""}`} value={form.i17} onChange={set("i17")} placeholder="0.00" />
          {rateRequired && !(Number(form.i17) > 0) && (
            <p data-testid="rate-required-warning" className="text-xs text-[#B84A3B] font-medium">
              Fatura tutarı girildiğinde kur zorunludur / Rate is required when invoice amount &gt; 0
            </p>
          )}
        </Field>
        <Field label="Fatura Tutarı (D21) · TL" labelEn="Actual Invoice Amount · optional">
          <Input data-testid="input-d21" type="number" min="0" step="any" className={inputCls} value={form.d21} onChange={set("d21")} placeholder="0.00" />
        </Field>
      </div>

      <Button
        data-testid="save-voucher-btn"
        onClick={onSave}
        disabled={saving || !(Number(form.d17) > 0) || (Number(form.d21) > 0 && !(Number(form.i17) > 0))}
        className="w-full bg-[#284236] hover:bg-[#1E3329] text-white font-semibold py-5 active:scale-[0.98] transition-all"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Kaydediliyor… / Saving…" : "Makbuzu Kaydet / Save Voucher"}
      </Button>
    </div>
  );
};
