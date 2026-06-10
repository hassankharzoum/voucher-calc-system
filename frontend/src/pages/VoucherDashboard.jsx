import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { calculateVoucher } from "@/lib/calc";
import { VoucherForm } from "@/components/VoucherForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HistoryTable } from "@/components/HistoryTable";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Receipt } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const today = () => new Date().toISOString().slice(0, 10);

export default function VoucherDashboard() {
  const [form, setForm] = useState({
    company_name: "", customer_code: "", invoice_no: "",
    voucher_date: today(), d17: "", i17: "", d21: "",
  });
  const [settings, setSettings] = useState({ kdv_rate: 10, invoice_divisor: 2 });
  const [vouchers, setVouchers] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadVouchers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/vouchers`);
      setVouchers(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    axios.get(`${API}/settings`).then((r) => setSettings(r.data)).catch(console.error);
    loadVouchers();
  }, [loadVouchers]);

  const results = useMemo(
    () =>
      calculateVoucher({
        d17: form.d17, i17: form.i17, d21: form.d21,
        kdvRate: settings.kdv_rate, divisor: settings.invoice_divisor,
      }),
    [form.d17, form.i17, form.d21, settings]
  );

  const rateRequired = Number(form.d21) > 0;

  const saveVoucher = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/vouchers`, {
        company_name: form.company_name,
        customer_code: form.customer_code,
        invoice_no: form.invoice_no,
        voucher_date: form.voucher_date,
        d17: Number(form.d17),
        i17: Number(form.i17) || 0,
        d21: Number(form.d21) || 0,
      });
      toast.success("Makbuz kaydedildi / Voucher saved");
      loadVouchers();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Kayıt başarısız / Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteVoucher = async (id) => {
    try {
      await axios.delete(`${API}/vouchers/${id}`);
      toast.success("Makbuz silindi / Voucher deleted");
      setVouchers((v) => v.filter((x) => x.id !== id));
    } catch (e) {
      toast.error("Silme başarısız / Delete failed");
    }
  };

  const saveSettings = async (s) => {
    try {
      const res = await axios.put(`${API}/settings`, s);
      setSettings(res.data);
      toast.success("Ayarlar güncellendi / Settings updated");
    } catch (e) {
      toast.error("Ayarlar kaydedilemedi / Settings save failed");
    }
  };

  return (
    <div className="min-h-screen" data-testid="voucher-dashboard">
      <header className="border-b border-[#D6D3CA] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#284236] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#C89F65]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none">TAHSİLAT MAKBUZU</h1>
              <p className="text-xs tracking-[0.25em] uppercase text-[#57665E]">Payment Voucher System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span data-testid="current-settings-badge" className="hidden sm:inline-block font-mono text-xs text-[#57665E] bg-[#F0EFEA] px-3 py-1.5 rounded">
              KDV {settings.kdv_rate}% · ÷{settings.invoice_divisor}
            </span>
            <SettingsDialog settings={settings} onSave={saveSettings} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <VoucherForm form={form} setForm={setForm} onSave={saveVoucher} saving={saving} rateRequired={rateRequired} />
          </div>
          <div className="lg:col-span-6">
            <ResultsPanel results={results} d17={Number(form.d17) || 0} />
          </div>
        </div>
        <HistoryTable vouchers={vouchers} onDelete={deleteVoucher} />
      </main>
    </div>
  );
}
