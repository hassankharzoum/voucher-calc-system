import { fmt } from "@/lib/calc";
import { Button } from "@/components/ui/button";
import { Printer, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HistoryTable = ({ vouchers, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-[#D6D3CA] shadow-sm overflow-hidden">
      <div className="p-6 pb-4">
        <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C89F65]">Geçmiş / History</p>
        <h2 className="text-xl font-bold mt-1">Kayıtlı Makbuzlar / Saved Vouchers</h2>
      </div>
      {vouchers.length === 0 ? (
        <p data-testid="history-empty-state" className="px-6 pb-6 text-sm text-[#57665E]">
          Henüz kayıtlı makbuz yok / No saved vouchers yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" data-testid="history-table">
            <thead>
              <tr>
                {["Tarih / Date", "Firma / Company", "Fatura No / Invoice", "Fiş (D17) USD", "Kur (I17)", "Fatura (D21) TL", "Nakit (D23) USD", "Havale (D25) TL", ""].map((h) => (
                  <th key={h} className="bg-[#F0EFEA] text-[#57665E] font-medium text-xs tracking-wider uppercase p-3 border-y border-[#D6D3CA] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} data-testid={`voucher-row-${v.id}`} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{v.voucher_date}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm">{v.company_name || "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{v.invoice_no || "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono font-semibold">{fmt(v.d17)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{v.i17 > 0 ? fmt(v.i17) : "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{fmt(v.d21)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{fmt(v.results.d23)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono">{fmt(v.results.d25)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] whitespace-nowrap">
                    <Button data-testid={`print-voucher-${v.id}`} variant="ghost" size="icon" className="h-8 w-8 text-[#284236] hover:bg-[#F0EFEA]" onClick={() => navigate(`/print/${v.id}`)}>
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button data-testid={`delete-voucher-${v.id}`} variant="ghost" size="icon" className="h-8 w-8 text-[#B84A3B] hover:bg-[#B84A3B]/10" onClick={() => onDelete(v.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
