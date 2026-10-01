import Link from "next/link";
import NoticeModal from "@/components/NoticeModal";
import { employees, DEPARTMENTS } from "@/lib/data/employees";
import { customers } from "@/lib/data/customers";
import { initialApprovals } from "@/lib/data/approvals";
import { notices } from "@/lib/data/notices";

export default function DashboardPage() {
  const pending = initialApprovals.filter((a) => a.status === "대기").length;
  const onLeave = employees.filter((e) => e.status === "휴직").length;
  const kpis = [
    { id: "kpi-employees", label: "전체 사원", value: employees.length, unit: "명" },
    { id: "kpi-customers", label: "고객사", value: customers.length, unit: "곳" },
    { id: "kpi-pending", label: "결재 대기", value: pending, unit: "건" },
    { id: "kpi-leave", label: "휴직자", value: onLeave, unit: "명" },
  ];
  const byDept = DEPARTMENTS.map((d) => ({
    name: d,
    count: employees.filter((e) => e.department === d).length,
  }));
  const max = Math.max(...byDept.map((d) => d.count));

  return (
    <div>
      <NoticeModal />
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">대시보드</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm text-zinc-500">{k.label}</div>
            <div className="mt-2 text-3xl font-bold text-cocoa-700">
              <span id={k.id}>{k.value}</span>
              <span className="ml-1 text-base font-normal text-zinc-500">{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-cocoa-900">부서별 인원</h2>
          <ul className="space-y-2">
            {byDept.map((d) => (
              <li key={d.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-zinc-600">{d.name}</span>
                <div className="h-3 flex-1 rounded bg-cocoa-50">
                  <div
                    className="h-3 rounded bg-cocoa-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-cocoa-900">최근 공지사항</h2>
            <Link href="/notices" className="text-sm text-cocoa-500 hover:underline">
              더보기
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 text-sm">
            {notices.slice(0, 5).map((n) => (
              <li key={n.id} className="flex justify-between py-2">
                <Link href={`/notices/${n.id}`} className="hover:underline">
                  {n.title}
                </Link>
                <span className="text-zinc-500">{n.date}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
