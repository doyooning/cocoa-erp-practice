"use client";

import { useState } from "react";
import { initialApprovals, type ApprovalStatus } from "@/lib/data/approvals";

const FILTERS: ("전체" | ApprovalStatus)[] = ["전체", "대기", "승인", "반려"];

const badge: Record<ApprovalStatus, string> = {
  대기: "bg-amber-100 text-amber-800",
  승인: "bg-emerald-100 text-emerald-800",
  반려: "bg-red-100 text-red-800",
};

export default function ApprovalsPage() {
  const [items, setItems] = useState(initialApprovals);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");

  function decide(id: string, status: ApprovalStatus) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const shown = filter === "전체" ? items : items.filter((a) => a.status === filter);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">결재</h1>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                filter === f
                  ? "border-cocoa-600 bg-cocoa-600 text-white"
                  : "bg-white text-zinc-700 hover:bg-cocoa-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span id="approval-total" className="text-sm text-zinc-600">
            총 {shown.length}건
          </span>
          <button
            id="btn-reset-approvals"
            type="button"
            onClick={() => setItems(initialApprovals)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            처리 상태 초기화
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table id="approval-table" className="w-full text-sm">
          <thead className="bg-cocoa-50 text-left text-cocoa-700">
            <tr>
              {["문서번호", "제목", "기안자", "기안일", "금액", "상태", "처리"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id} className="border-t border-zinc-100">
                <td className="whitespace-nowrap px-3 py-2">{a.id}</td>
                <td className="px-3 py-2">{a.title}</td>
                <td className="px-3 py-2">{a.drafter}</td>
                <td className="whitespace-nowrap px-3 py-2">{a.draftDate}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                  {a.amount.toLocaleString("ko-KR")}원
                </td>
                <td className="px-3 py-2">
                  <span
                    data-status={a.status}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[a.status]}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {a.status === "대기" ? (
                    <div className="flex gap-1">
                      <button
                        id={`approve-${a.id}`}
                        type="button"
                        onClick={() => decide(a.id, "승인")}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                      >
                        승인
                      </button>
                      <button
                        id={`reject-${a.id}`}
                        type="button"
                        onClick={() => decide(a.id, "반려")}
                        className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                      >
                        반려
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-400">처리완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
