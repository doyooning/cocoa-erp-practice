"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
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
