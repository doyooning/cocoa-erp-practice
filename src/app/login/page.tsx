"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      if (res.ok) {
        router.replace("/dashboard");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "로그인에 실패했습니다.");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-cocoa-50 p-4">
      <div className="flex w-full flex-1 items-center justify-center">
      <form
        id="login-form"
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="text-3xl">☕</div>
          <h1 className="mt-1 text-2xl font-bold text-cocoa-900">코코아 ERP</h1>
          <p className="mt-1 text-sm text-zinc-500">사내 업무 시스템</p>
        </div>

        <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
          아이디
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mb-4 mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          required
        />

        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          required
        />

        {error && (
          <p id="login-error" role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          id="btn-login"
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-cocoa-600 py-2.5 font-medium text-white hover:bg-cocoa-700 disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      </div>
      <footer
        id="site-footer"
        className="mt-6 max-w-xl text-center text-xs leading-relaxed text-zinc-500"
      >
        <p>
          본 서비스는 공식 서비스가 아니며, RPA(UiPath) 자동화 실습을 위해 만든 데모 사이트입니다.
        </p>
        <p>
          사이트에 사용된 모든 회사·사원·고객사 등의 데이터는 가상으로 만든 것이며 실제와 무관합니다.
        </p>
      </footer>
    </main>
  );
}
