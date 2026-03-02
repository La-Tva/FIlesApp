"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Copy, Check } from "lucide-react";

export function QRModal({ spaceSlug }: { spaceSlug: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/dashboard/${spaceSlug}`);
  }, [spaceSlug]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Open on another device</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400 text-center">
          Scan this code to open the space on your phone instantly
        </p>
        <div className="flex justify-center p-4 bg-white rounded-2xl">
          <QRCodeCanvas value={url} size={200} />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors w-full"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
