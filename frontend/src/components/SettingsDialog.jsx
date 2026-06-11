import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const SettingsDialog = ({ settings, onSave }) => {
  const { t } = useLang();
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
          <SettingsIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-[#D6D3CA]">
        <DialogHeader>
          <DialogTitle className="font-bold">{t("settings_title")}</DialogTitle>
          <DialogDescription className="text-[#57665E]">{t("settings_desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#182620]">{t("kdv_rate")}</Label>
            <Input data-testid="settings-kdv-rate" type="number" min="0" step="any" className="font-mono num" value={kdv} onChange={(e) => setKdv(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#182620]">{t("divisor")}</Label>
            <Input data-testid="settings-invoice-divisor" type="number" min="0.01" step="any" className="font-mono num" value={div} onChange={(e) => setDiv(e.target.value)} />
            <p className="text-xs text-[#57665E]">{t("divisor_help")}</p>
          </div>
          <Button data-testid="settings-save-btn" onClick={save} disabled={!(Number(div) > 0) || Number(kdv) < 0} className="w-full bg-[#284236] hover:bg-[#1E3329] text-white">
            {t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
