"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function QRCodeDisplay() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  if (!url) return null;

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 inline-block">
        <QRCode value={url} size={120} />
      </div>
      <p className="text-sm text-gray-500 mt-2">QR코드로 접속</p>
    </div>
  );
}
