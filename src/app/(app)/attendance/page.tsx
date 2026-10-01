"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import { employees } from "@/lib/data/employees";

type Leave = {
  no: number;
  employee: string;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: string;
};

const columns: Column<Leave>[] = [
  { key: "no", header: "번호" },
  { key: "employee", header: "신청자" },
  { key: "type", header: "휴가유형" },
  { key: "from", header: "시작일" },
  { key: "to", header: "종료일" },
  { key: "reason", header: "사유" },
  { key: "status", header: "상태" },
];

const TYPES = ["연차", "반차", "병가", "경조사", "공가"];

const seed: Leave[] = [
  { no: 3, employee: employees[4].name, type: "연차", from: "2026-10-08", to: "2026-10-09", reason: "개인 사정", status: "승인" },
  { no: 2, employee: employees[11].name, type: "병가", from: "2026-09-29", to: "2026-09-29", reason: "병원 진료", status: "승인" },
  { no: 1, employee: employees[20].name, type: "반차", from: "2026-09-25", to: "2026-09-25", reason: "은행 업무", status: "승인" },
];

export default function AttendancePage() {
  const [rows, setRows] = useState<Leave[]>(seed);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    employee: employees[0].name,
    type: TYPES[0],
    from: "",
    to: "",
    reason: "",
  });

  function set(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.to < form.from) {
      setMessage("종료일은 시작일 이후여야 합니다.");
      return;
    }
    setRows((prev) => [
      { no: prev.length + 1, ...form, status: "신청" },
      ...prev,
    ].sort((a, b) => b.no - a.no));
    setMessage(`휴가 신청이 완료되었습니다. (${form.employee}, ${form.from} ~ ${form.to})`);
    setForm((f) => ({ ...f, from: "", to: "", reason: "" }));
  }

  const field = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">근태/휴가</h1>

      <form
        id="leave-form"
        onSubmit={submit}
        className="mb-8 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-3"
      >
        <label className="text-sm font-medium text-zinc-700">
          신청자
          <select
            id="leave-employee"
            name="employee"
            value={form.employee}
            onChange={(e) => set("employee", e.target.value)}
            className={field}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.name}>
                {e.name} ({e.department})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-700">
          휴가유형
          <select
            id="leave-type"
            name="type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className={field}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <div className="hidden md:block" />
        <label className="text-sm font-medium text-zinc-700">
          시작일
          <input
            id="leave-from"
            name="from"
            type="date"
            required
            value={form.from}
            onChange={(e) => set("from", e.target.value)}
            className={field}
          />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          종료일
          <input
            id="leave-to"
            name="to"
            type="date"
            required
            value={form.to}
            onChange={(e) => set("to", e.target.value)}
            className={field}
          />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          사유
          <input
            id="leave-reason"
            name="reason"
            type="text"
            required
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
            className={field}
          />
        </label>
        <div className="flex items-center gap-4 md:col-span-3">
          <button
            id="btn-leave-submit"
            type="submit"
            className="rounded-md bg-cocoa-600 px-5 py-2 text-sm font-medium text-white hover:bg-cocoa-700"
          >
            휴가 신청
          </button>
          {message && (
            <span id="leave-message" role="status" className="text-sm text-emerald-700">
              {message}
            </span>
          )}
        </div>
      </form>

      <h2 className="mb-3 font-semibold text-cocoa-900">휴가 신청 내역</h2>
      <DataTable tableId="leave-table" columns={columns} rows={rows} searchPlaceholder="신청자·유형 검색" />
    </div>
  );
}
