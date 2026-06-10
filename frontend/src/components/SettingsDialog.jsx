import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

export const SettingsDialog = ({ settings, onSave }) => {
  const [open, setOpen] = useState(false);
  const [kdv, setKdv] = useState(settings.kdv_rate);
  const [div, setDiv] = useState(settings.invoice_divisor);

  useEffect(() => {
    setKdv(settings.kdv_rate);
    setDiv(settings.invoice_divisor);
  }, [settings]);

  const save = async () => {
    await onSave({ kdv_rate: Number(kdv), invoice_divisor: Number(div) });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="open-settings-btn" variant="outline" className="border-[#D6D3CA] text-[#284236] hover:bg-[#F0EFEA]">
          <SettingsIcon className="w-4 h-4 mr-2" />
          Ayarlar / Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-[#D6D3CA]">
        <DialogHeader>
          <DialogTitle className="font-bold">Hesaplama Ayarları / Calculation Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#57665E]">KDV Oranı % / KDV Rate %</Label>
            <Input data-testid="settings-kdv-rate" type="number" min="0" step="any" className="font-mono" value={kdv} onChange={(e) => setKdv(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#57665E]">Fatura Bölen / Invoice Divisor (D19 = D17 ÷ divisor × I17)</Label>
            <Input data-testid="settings-invoice-divisor" type="number" min="0.01" step="any" className="font-mono" value={div} onChange={(e) => setDiv(e.target.value)} />
          </div>
          <Button data-testid="settings-save-btn" onClick={save} disabled={!(Number(div) > 0) || Number(kdv) < 0} className="w-full bg-[#284236] hover:bg-[#1E3329] text-white">
            Kaydet / Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
