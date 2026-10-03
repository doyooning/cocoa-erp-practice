"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
import { employees } from "@/lib/data/employees";
import { LEAVE_STATUSES, LEAVE_TYPES, type Leave, type LeaveStatus } from "@/lib/data/leaves";

const columns: Column<Leave>[] = [
  { key: "no", header: "번호" },
  { key: "employee", header: "신청자" },
  { key: "department", header: "부서" },
  { key: "type", header: "휴가유형" },
  { key: "from", header: "시작일" },
  { key: "to", header: "종료일" },
  { key: "days", header: "일수" },
  { key: "reason", header: "사유" },
  { key: "status", header: "상태" },
  { key: "note", header: "비고", className: "max-w-[16rem] truncate" },
];

const filters = [
  { key: "type" as const, label: "휴가유형", options: LEAVE_TYPES },
  { key: "status" as const, label: "상태", options: LEAVE_STATUSES },
];

const dateFilters = [{ key: "from" as const, label: "시작일" }];

const statusBadge: Record<LeaveStatus, string> = {
  신청: "bg-amber-100 text-amber-800",
  승인: "bg-emerald-100 text-emerald-800",
  반려: "bg-red-100 text-red-800",
};

export default function LeaveTable({ initialRows }: { initialRows: Leave[] }) {
  // 처리 결과는 새로고침하거나 '처리 상태 초기화'를 누르면 되돌아간다(실습 반복용).
  const [rows, setRows] = useState<Leave[]>(initialRows);
  const [selectedNo, setSelectedNo] = useState<number | null>(null);
  const selected = rows.find((r) => r.no === selectedNo) ?? null;
  const pending = rows.filter((r) => r.status === "신청").length;

  function decide(no: number, status: LeaveStatus, note: string) {
    setRows((prev) => prev.map((r) => (r.no === no ? { ...r, status, note } : r)));
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm text-zinc-600">
          승인대기 <b id="leave-pending" className="text-cocoa-700">{pending}</b>건 / 전체{" "}
          <b id="leave-count">{rows.length}</b>건
        </p>
        <button
          id="btn-reset-leaves"
          type="button"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          onClick={() => {
            setRows(initialRows);
            setSelectedNo(null);
          }}
        >
          처리 상태 초기화
        </button>
      </div>

      <DataTable
        tableId="leave-table"
        columns={columns}
        rows={rows}
        filters={filters}
        dateFilters={dateFilters}
        searchPlaceholder="신청자·사유 검색"
        rowKey={(r) => String(r.no)}
        primaryKey="employee"
        onRowClick={(r) => setSelectedNo(r.no)}
      />

      <LeaveRequestForm
        onAdd={(leave) => {
          setRows((prev) => [{ ...leave, no: Math.max(0, ...prev.map((p) => p.no)) + 1 }, ...prev]);
        }}
      />

      {selected && (
        <LeaveModal
          key={selected.no}
          item={selected}
          onDecide={(status, note) => decide(selected.no, status, note)}
          onClose={() => setSelectedNo(null)}
        />
      )}
    </>
  );
}

function LeaveModal({
  item,
  onDecide,
  onClose,
}: {
  item: Leave;
  onDecide: (status: LeaveStatus, note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const pending = item.status === "신청";

  function approve() {
    onDecide("승인", note.trim());
    setError("");
    setMessage(`${item.employee} 님의 휴가 신청을 승인했습니다.`);
  }

  function reject() {
    if (!note.trim()) {
      setMessage("");
      setError("반려 사유를 입력해야 반려할 수 있습니다.");
      return;
    }
    onDecide("반려", note.trim());
    setError("");
    setMessage(`${item.employee} 님의 휴가 신청을 반려했습니다.`);
  }

  return (
    <Modal
      id="leave-modal"
      title={
        <>
          <span id="leave-detail-employee">{item.employee}</span> · {item.type}{" "}
          <span
            id="leave-detail-status"
            className={`ml-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium ${statusBadge[item.status]}`}
          >
            {item.status}
          </span>
        </>
      }
      subtitle={
        <>
          신청번호 <span id="leave-detail-no">{item.no}</span> · {item.department}
        </>
      }
      onClose={onClose}
      footer={
        <>
          {pending ? (
            <>
              <button id="btn-leave-reject" type="button" className={btnGhost} onClick={reject}>
                반려
              </button>
              <button id="btn-leave-approve" type="button" className={btnPrimary} onClick={approve}>
                승인
              </button>
            </>
          ) : (
            <span id="leave-decided" className="mr-auto self-center text-sm text-zinc-500">
              이미 처리된 신청입니다.
            </span>
          )}
          <button id="btn-detail-close" type="button" className={btnGhost} onClick={onClose}>
            닫기
          </button>
        </>
      }
    >
      {message && (
        <p id="leave-detail-message" role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p id="leave-detail-error" role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Section title="신청 정보">
        <InfoGrid
          items={[
            { label: "휴가유형", value: item.type, id: "leave-detail-type" },
            { label: "기간", value: `${item.from} ~ ${item.to}`, id: "leave-detail-period" },
            { label: "일수", value: `${item.days}일`, id: "leave-detail-days" },
            { label: "사유", value: item.reason, id: "leave-detail-reason" },
          ]}
        />
      </Section>

      <Section title={pending ? "비고 (반려 시 사유 필수)" : "비고"}>
        {pending ? (
          <textarea
            id="leave-note"
            name="note"
            rows={3}
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="반려 사유를 입력하세요"
          />
        ) : (
          <p id="leave-detail-note" className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
            {item.note || "-"}
          </p>
        )}
      </Section>
    </Modal>
  );
}

/**
 * 관리자 화면에서는 기본으로 접혀 있다.
 * 자동화로 신청 데이터를 만들 때 쓰려고 폼 자체와 요소 id는 그대로 남겨 둔다.
 */
function LeaveRequestForm({ onAdd }: { onAdd: (leave: Omit<Leave, "no">) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    employee: employees[0].name,
    type: LEAVE_TYPES[0],
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
    const days =
      form.type === "반차"
        ? 0.5
        : Math.round((Date.parse(form.to) - Date.parse(form.from)) / 86400000) + 1;
    onAdd({
      employee: form.employee,
      department: employees.find((e) => e.name === form.employee)?.department ?? "",
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      reason: form.reason,
      status: "신청",
      note: "",
    });
    setMessage(`휴가 신청이 완료되었습니다. (${form.employee}, ${form.from} ~ ${form.to})`);
    setForm((f) => ({ ...f, from: "", to: "", reason: "" }));
  }

  const field = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="mt-8">
      <button
        id="btn-leave-form-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="leave-form"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-50"
      >
        {open ? "▴ 휴가 대리 신청 닫기" : "▾ 휴가 대리 신청 (자동화 전용)"}
      </button>

      {open && (
        <form
          id="leave-form"
          onSubmit={submit}
          className="mt-3 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-3"
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
              {LEAVE_TYPES.map((t) => (
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
      )}
    </div>
  );
}
