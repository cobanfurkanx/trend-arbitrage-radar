"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="text-ochre" size={28} />
      <h1 className="text-lg font-semibold text-ink">Bir şeyler ters gitti.</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Bu görünüm yüklenirken beklenmeyen bir hata oluştu. Büyük ihtimalle geçici bir sorundur.
      </p>
      <button onClick={reset} className="btn-primary py-2">
        Tekrar dene
      </button>
    </div>
  );
}
