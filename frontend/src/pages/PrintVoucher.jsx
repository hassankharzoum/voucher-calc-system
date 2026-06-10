import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { fmt } from "@/lib/calc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Row = ({ label, value, unit, bold }) => (
  <div className="flex items-end gap-2 py-1.5">
    <span className={`text-sm w-56 shrink-0 uppercase ${bold ? "font-bold" : "font-semibold"}`}>{label}</span>
    <span className={`font-mono flex-1 text-right border-b border-dotted border-[#57665E] ${bold ? "font-bold text-base" : "text-sm"}`}>
      {value}
    </span>
    <span className="text-xs w-10 text-[#57665E]">{unit}</span>
  </div>
);

const DottedField = ({ label, value }) => (
  <div className="flex items-end gap-2 py-1.5">
    <span className="text-sm font-semibold w-40 shrink-0 uppercase">{label}</span>
    <span className="flex-1 dotted-line text-sm px-1">{value}</span>
  </div>
);

export default function PrintVoucher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`${API}/vouchers/${id}`).then((r) => setVoucher(r.data)).catch(() => setError(true));
  }, [id]);

  if (error) return <p data-testid="print-not-found" className="p-10 text-center text-[#B84A3B]">Makbuz bulunamadı / Voucher not found</p>;
  if (!voucher) return <p className="p-10 text-center text-[#57665E]">Yükleniyor… / Loading…</p>;

  const r = voucher.results;

  return (
    <div className="min-h-screen py-8 px-4" data-testid="print-voucher-page">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between no-print">
        <Button data-testid="print-back-btn" variant="outline" className="border-[#D6D3CA]" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Geri / Back
        </Button>
        <Button data-testid="print-now-btn" className="bg-[#284236] hover:bg-[#1E3329] text-white" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Yazdır / Print
        </Button>
      </div>

      <div className="print-sheet bg-white max-w-[210mm] mx-auto border border-[#D6D3CA] shadow-sm p-10 md:p-12">
        <div className="flex justify-between items-start mb-10">
          <div className="w-14 h-14 rounded-md bg-[#284236] flex items-center justify-center text-[#C89F65] font-extrabold text-xl">
            TM
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-extrabold tracking-tight">TAHSİLAT MAKBUZU</h1>
            <p className="text-sm tracking-[0.3em] uppercase text-[#57665E]">Payment Voucher</p>
            <p className="text-sm mt-2 font-mono">
              <span className="font-semibold">TARİH / DATE:</span> {voucher.voucher_date}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <DottedField label="Firma Adı" value={voucher.company_name} />
          <DottedField label="Müşteri Kodu" value={voucher.customer_code} />
          <DottedField label="Fatura No" value={voucher.invoice_no} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div>
            <Row label="Sipariş Fişi Tutarı" value={fmt(voucher.d17)} unit="USD" bold />
            <Row label="Fatura Ol. Tutar" value={fmt(r.d19)} unit="TL" />
            <Row label="Fatura Tutar" value={fmt(voucher.d21)} unit="TL" />
            <Row label="Ödenen Tutar N." value={fmt(r.d23)} unit="USD" />
            <Row label="Havale Tutar H." value={fmt(r.d25)} unit="TL" />
            <Row label="Toplam" value={fmt(r.d27)} unit="USD" bold />
          </div>
          <div>
            <Row label="Dolar Kuru" value={voucher.i17 > 0 ? fmt(voucher.i17) : "—"} unit="" />
            <Row label="KDV Tutar" value={fmt(r.i19)} unit="TL" />
            <Row label="KDV Tutar" value={fmt(r.i21)} unit="TL" />
            <Row label="KDV Farkı" value={fmt(r.i23)} unit="TL" />
            <Row label="KDV Farkı" value={fmt(r.i25)} unit="USD" />
          </div>
        </div>

        <div className="mt-14 space-y-6 max-w-md">
          <DottedField label="Teslim Alan" value="" />
          <DottedField label="GSM" value="" />
          <DottedField label="İmza" value="" />
        </div>

        <p className="mt-10 text-[10px] text-[#8a948e] font-mono">
          KDV {voucher.kdv_rate}% · Bölen/Divisor {voucher.invoice_divisor} · ID {voucher.id.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
