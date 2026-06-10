import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import VoucherDashboard from "@/pages/VoucherDashboard";
import PrintVoucher from "@/pages/PrintVoucher";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<VoucherDashboard />} />
        <Route path="/print/:id" element={<PrintVoucher />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
