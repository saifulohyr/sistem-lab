"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PrintQRCodePage() {
  const router = useRouter();
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventaris")
      .then(res => res.json())
      .then(data => {
        if (data.data) setInventories(data.data);
      })
      .catch(() => toast.error("Gagal mengambil data"))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Cetak Label QR Code</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Print label barang untuk ditempel di inventaris</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9">
          <Printer className="mr-1.5 h-3.5 w-3.5" /> Cetak Label (Ctrl+P)
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 print:grid-cols-4 print:gap-2">
        {inventories.map((inv) => (
          <div key={inv.id} className="border-2 border-dashed border-gray-300 p-4 rounded-xl flex flex-col items-center justify-center text-center bg-white break-inside-avoid shadow-sm print:shadow-none print:border-black">
            <QRCode
              size={120}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`https://labmuma.app/scan/${inv.code}`}
              viewBox={`0 0 120 120`}
            />
            <div className="mt-3 w-full">
              <p className="font-bold text-xs leading-tight line-clamp-2">{inv.name}</p>
              <p className="text-[10px] font-mono mt-1 px-1 bg-gray-100 rounded print:bg-transparent border print:border-none">{inv.code}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{inv.room?.name || "LAB RPL"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
