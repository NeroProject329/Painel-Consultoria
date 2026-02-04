import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="app-bg flex min-h-screen items-center justify-center px-4">
          <div className="card w-full max-w-md p-6">
            <div className="h-3 w-32 rounded bg-black/10" />
            <div className="mt-4 h-10 rounded bg-black/10" />
            <div className="mt-3 h-10 rounded bg-black/10" />
            <div className="mt-4 h-10 rounded bg-black/10" />
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
