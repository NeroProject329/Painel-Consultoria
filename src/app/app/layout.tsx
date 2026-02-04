"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = isAuthed();
    if (!ok) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/app")}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-neutral-600">Carregando…</div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
