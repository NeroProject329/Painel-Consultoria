"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed, subscribeAuth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribeAuth, isAuthed, () => false);

  useEffect(() => {
    const ok = isAuthed();
    if (!ok) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/app")}`);
      return;
    }
  }, [router, pathname, ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[var(--muted)]">Carregando…</div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
