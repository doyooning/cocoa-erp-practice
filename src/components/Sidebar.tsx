"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NOTICE_HIDE_KEY } from "@/lib/auth";

const MENUS = [
  { href: "/dashboard", label: "대시보드", id: "menu-dashboard" },
  { href: "/employees", label: "사원관리", id: "menu-employees" },
  { href: "/customers", label: "고객사관리", id: "menu-customers" },
  { href: "/attendance", label: "근태/휴가", id: "menu-attendance" },
  { href: "/overtime", label: "초과 승인", id: "menu-overtime" },
  { href: "/approvals", label: "결재", id: "menu-approvals" },
  { href: "/notices", label: "공지사항", id: "menu-notices" },
  { href: "/requests", label: "요청사항", id: "menu-requests" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      localStorage.removeItem(NOTICE_HIDE_KEY);
      sessionStorage.removeItem("cocoa_notice_seen");
    } catch {
      // 무시
    }
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    // 목록이 긴 화면에서도 하단의 로그아웃이 보이도록 사이드바를 화면에 고정한다.
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col self-start bg-cocoa-900 text-cocoa-100">
      <div className="px-5 py-5 text-xl font-bold tracking-tight text-white">
        ☕ 코코아 ERP
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {MENUS.map((m) => {
          const active = pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              id={m.id}
              href={m.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-cocoa-600 text-white" : "hover:bg-cocoa-700"
              }`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-cocoa-700 p-4 text-sm">
        <div id="user-name" className="mb-2 text-cocoa-100">
          admin 님
        </div>
        <button
          id="btn-logout"
          type="button"
          onClick={logout}
          className="w-full rounded-md border border-cocoa-500 px-3 py-1.5 text-white hover:bg-cocoa-700"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
