import { fmt } from "@/lib/calc";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Printer, Trash2, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HistoryTable = ({ vouchers, onDelete }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  const headers = [
    t("th_date"), t("th_company"), t("th_invoice_no"), t("th_voucher"),
    t("th_rate"), t("th_invoice"), t("th_cash"), t("th_transfer"), "",
  ];

  return (
    <div className="bg-white rounded-xl border border-[#D6D3CA] shadow-sm overflow-hidden">
      <div className="p-6 pb-4 flex items-center gap-2.5">
        <Archive className="w-5 h-5 text-[#C89F65]" />
        <h2 className="text-lg font-bold">{t("history")}</h2>
      </div>
      {vouchers.length === 0 ? (
        <p data-testid="history-empty-state" className="px-6 pb-6 text-sm text-[#57665E]">
          {t("no_vouchers")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse" data-testid="history-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="bg-[#F0EFEA] text-[#57665E] font-semibold text-xs tracking-wider uppercase p-3 border-y border-[#D6D3CA] whitespace-nowrap text-start">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} data-testid={`voucher-row-${v.id}`} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num">{v.voucher_date}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-medium">{v.company_name || "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num">{v.invoice_no || "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num font-bold">{fmt(v.d17)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num">{v.i17 > 0 ? fmt(v.i17) : "—"}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num">{fmt(v.d21)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num text-[#a56a22] font-semibold">{fmt(v.results.d23)}</td>
                  <td className="p-3 border-b border-[#D6D3CA] text-sm font-mono num">{fmt(v.results.d25)}</td>
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
