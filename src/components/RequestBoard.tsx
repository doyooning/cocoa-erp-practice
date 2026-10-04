"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
import { DEPARTMENTS } from "@/lib/data/employees";
import { fmtStamp, nowKST, type Request, type RequestStatus } from "@/lib/data/requests";

const columns: Column<Request>[] = [
  { key: "id", header: "번호" },
  { key: "department", header: "부서" },
  { key: "employee", header: "작성자" },
  { key: "createdAt", header: "작성시간" },
  { key: "title", header: "제목" },
  { key: "content", header: "내용", className: "max-w-[24rem] truncate" },
  { key: "status", header: "상태" },
];

const filters = [
  { key: "department" as const, label: "부서", options: DEPARTMENTS },
  { key: "status" as const, label: "상태", options: ["답변대기", "답변완료"] },
];

const statusBadge: Record<RequestStatus, string> = {
  답변대기: "bg-amber-100 text-amber-800",
  답변완료: "bg-emerald-100 text-emerald-800",
};

export default function RequestBoard({ initialRows }: { initialRows: Request[] }) {
  // 답글은 브라우저 메모리에만 남는다. 새로고침하거나 '처리 상태 초기화'를 누르면 되돌아간다.
  const [rows, setRows] = useState<Request[]>(initialRows);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const waiting = rows.filter((r) => r.status === "답변대기").length;

  function reply(id: string, text: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, reply: text, status: "답변완료" as RequestStatus, repliedAt: fmtStamp(nowKST()) }
          : r,
      ),
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm text-zinc-600">
          답변대기 <b id="request-waiting" className="text-cocoa-700">{waiting}</b>건 / 전체{" "}
          <b id="request-count">{rows.length}</b>건
        </p>
        <button
          id="btn-reset-requests"
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
        tableId="request-table"
        columns={columns}
        rows={rows}
        filters={filters}
        exportHref="/api/export/requests"
        searchPlaceholder="작성자·제목·내용 검색"
        rowKey={(r) => r.id}
        primaryKey="title"
        onRowClick={(r) => setSelectedId(r.id)}
      />

      {selected && (
        <RequestModal
          key={selected.id}
          item={selected}
          onReply={(text) => reply(selected.id, text)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function RequestModal({
  item,
  onReply,
  onClose,
}: {
  item: Request;
  onReply: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!draft.trim()) {
      setMessage("");
      setError("답글 내용을 입력해야 등록할 수 있습니다.");
      return;
    }
    onReply(draft.trim());
    setError("");
    setMessage(`${item.id} 요청에 답글을 등록했습니다.`);
  }

  return (
    <Modal
      id="request-modal"
      title={
        <>
          <span id="request-detail-title">{item.title}</span>{" "}
          <span
            id="request-detail-status"
            className={`ml-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium ${statusBadge[item.status]}`}
          >
            {item.status}
          </span>
        </>
      }
      subtitle={
        <>
          <span id="request-detail-id">{item.id}</span> ·{" "}
          <span id="request-detail-writer">
            {item.department} {item.employee}
          </span>{" "}
          · <span id="request-detail-created">{item.createdAt}</span>
        </>
      }
      onClose={onClose}
      footer={
        <>
          <button id="btn-reply-submit" type="button" className={btnPrimary} onClick={submit}>
            {item.status === "답변완료" ? "답글 수정" : "답글 등록"}
          </button>
          <button id="btn-detail-close" type="button" className={btnGhost} onClick={onClose}>
            닫기
          </button>
        </>
      }
    >
      {message && (
        <p id="reply-message" role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p id="reply-error" role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Section title="작성 정보">
        <InfoGrid
          items={[
            { label: "작성자", value: item.employee, id: "request-detail-employee" },
            { label: "부서", value: item.department, id: "request-detail-department" },
            { label: "작성시간", value: item.createdAt, id: "request-detail-time" },
            { label: "상태", value: item.status, id: "request-detail-state" },
          ]}
        />
      </Section>

      <Section title="요청 내용">
        <p
          id="request-detail-content"
          className="whitespace-pre-wrap rounded-md bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-800"
        >
          {item.content}
        </p>
      </Section>

      {item.reply && (
        <Section title="등록된 답글">
          <p id="request-detail-reply" className="rounded-md bg-cocoa-50 px-3 py-2 text-sm text-zinc-800">
            {item.reply}
          </p>
          <p id="request-detail-replied-at" className="mt-1 text-xs text-zinc-500">
            {item.repliedAt}
          </p>
        </Section>
      )}

      <Section title="답글 작성">
        <textarea
          id="reply-text"
          name="reply"
          rows={3}
          className={inputCls}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="답글 내용을 입력하세요"
        />
      </Section>
    </Modal>
  );
}
