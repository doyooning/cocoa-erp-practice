"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
import {
  fmtHours,
  OT_CATEGORIES,
  OT_STATUSES,
  type Overtime,
  type OvertimeStatus,
} from "@/lib/data/overtime";

const columns: Column<Overtime>[] = [
  { key: "date", header: "일자" },
  { key: "empName", header: "신청자" },
  { key: "category", header: "업무구분" },
  { key: "time", header: "시간" },
  { key: "title", header: "업무명" },
  { key: "content", header: "내용", className: "max-w-[20rem] truncate" },
  { key: "customer", header: "고객사" },
  { key: "status", header: "상태" },
  { key: "note", header: "비고", className: "max-w-[14rem] truncate" },
];

const filters = [
  { key: "status" as const, label: "상태", options: OT_STATUSES },
  { key: "category" as const, label: "업무구분", options: OT_CATEGORIES },
];

const dateFilters = [{ key: "date" as const, label: "일자" }];

export const statusBadge: Record<OvertimeStatus, string> = {
  승인대기: "bg-amber-100 text-amber-800",
  승인완료: "bg-emerald-100 text-emerald-800",
  반려: "bg-red-100 text-red-800",
};

export default function OvertimeTable({ initialRows }: { initialRows: Overtime[] }) {
  // 처리 결과는 새로고침하면 초기화된다(실습 반복용).
  const [rows, setRows] = useState<Overtime[]>(initialRows);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  function decide(id: string, status: OvertimeStatus, note: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status, note } : r)));
  }

  const pending = rows.filter((r) => r.status === "승인대기").length;

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm text-zinc-600">
          승인대기 <b id="overtime-pending" className="text-cocoa-700">{pending}</b>건 / 전체{" "}
          <b id="overtime-count">{rows.length}</b>건
        </p>
        <button
          id="btn-reset-overtime"
          type="button"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          onClick={() => {
            setRows(initialRows);
            setSelectedId(null);
          }}
        >
          처리 상태 초기화
        </button>
      </div>
      <DataTable
        tableId="overtime-table"
        columns={columns}
        rows={rows}
        filters={filters}
        dateFilters={dateFilters}
        exportHref="/api/export/overtime"
        searchPlaceholder="신청자·업무명·고객사 검색"
        rowKey={(r) => r.id}
        primaryKey="empName"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      {selected && (
        <OvertimeModal
          key={selected.id}
          item={selected}
          onDecide={(status, note) => decide(selected.id, status, note)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function OvertimeModal({
  item,
  onDecide,
  onClose,
}: {
  item: Overtime;
  onDecide: (status: OvertimeStatus, note: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const pending = item.status === "승인대기";

  function approve() {
    onDecide("승인완료", reason.trim());
    setError("");
    setMessage(`${item.id} 초과 업무를 승인했습니다.`);
  }

  function reject() {
    if (!reason.trim()) {
      setMessage("");
      setError("반려 사유를 입력해야 반려할 수 있습니다.");
      return;
    }
    onDecide("반려", reason.trim());
    setError("");
    setMessage(`${item.id} 초과 업무를 반려했습니다.`);
  }

  return (
    <Modal
      id="overtime-modal"
      title={
        <>
          <span id="detail-title">{item.title}</span>{" "}
          <span
            id="detail-status"
            className={`ml-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium ${statusBadge[item.status]}`}
          >
            {item.status}
          </span>
        </>
      }
      subtitle={
        <>
          <span id="detail-id">{item.id}</span> · {item.empName} ({item.department})
        </>
      }
      onClose={onClose}
      footer={
        <>
          {pending ? (
            <>
              <button id="btn-ot-reject" type="button" className={btnGhost} onClick={reject}>
                반려
              </button>
              <button id="btn-ot-approve" type="button" className={btnPrimary} onClick={approve}>
                승인
              </button>
            </>
          ) : (
            <span id="ot-decided" className="mr-auto self-center text-sm text-zinc-500">
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
        <p id="ot-message" role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p id="ot-error" role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Section title="신청 정보">
        <InfoGrid
          items={[
            { label: "일자", value: item.date, id: "detail-date" },
            { label: "신청자", value: `${item.empName} (${item.empId})`, id: "detail-emp" },
            { label: "부서", value: item.department, id: "detail-department" },
            { label: "업무구분", value: item.category, id: "detail-category" },
            { label: "고객사", value: item.customer, id: "detail-customer" },
            {
              label: "시간",
              value: (
                <>
                  <span id="detail-start">{item.startTime}</span> ~{" "}
                  <span id="detail-end">{item.endTime}</span> (총{" "}
                  <b id="detail-hours">{fmtHours(item.hours)}</b>시간)
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="업무 내용">
        <p id="detail-content" className="whitespace-pre-wrap rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
          {item.content}
        </p>
      </Section>

      <Section title={pending ? "비고 (반려 시 사유 필수)" : "비고"}>
        {pending ? (
          <textarea
            id="ot-note"
            name="note"
            rows={3}
            className={inputCls}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="반려 사유를 입력하세요"
          />
        ) : (
          <p id="detail-note" className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
            {item.note || "-"}
          </p>
        )}
      </Section>
    </Modal>
  );
}
