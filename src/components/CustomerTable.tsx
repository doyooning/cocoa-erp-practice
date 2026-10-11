"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
import { customers as seed, CONTRACTS, INDUSTRY, type Customer } from "@/lib/data/customers";
import { customerExtras, type Note } from "@/lib/data/details";

// 계약 정보(기간·연 계약금·결제조건)는 상세 모달에서 수정할 수 있어 행 상태로 들고 있는다.
type ContractInfo = { contractStart: string; contractEnd: string; annualAmount: number; terms: string };
type Row = Customer & ContractInfo & { notes: Note[] };

const columns: Column<Row>[] = [
  { key: "id", header: "고객사코드" },
  { key: "name", header: "회사명" },
  { key: "ceo", header: "대표자" },
  { key: "industry", header: "업종" },
  { key: "manager", header: "담당자" },
  { key: "phone", header: "연락처" },
  { key: "email", header: "이메일" },
  { key: "address", header: "주소" },
  { key: "contract", header: "계약상태" },
];

const REGIONS = [...new Set(seed.map((c) => c.region))].sort();

const filters = [
  { key: "industry" as const, label: "업종", options: INDUSTRY },
  { key: "contract" as const, label: "계약상태", options: CONTRACTS },
  { key: "region" as const, label: "지역", options: REGIONS },
];

const badge: Record<Customer["contract"], string> = {
  계약중: "bg-emerald-100 text-emerald-800",
  협의중: "bg-amber-100 text-amber-800",
  종료: "bg-zinc-200 text-zinc-700",
};

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function CustomerTable() {
  // 수정 내용은 새로고침하면 초기화된다(실습 반복용).
  const [rows, setRows] = useState<Row[]>(() =>
    seed.map((c) => {
      const x = customerExtras(c);
      return { ...c, notes: x.notes, contractStart: x.contractStart, contractEnd: x.contractEnd, annualAmount: x.annualAmount, terms: x.terms };
    }),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <>
      <DataTable
        tableId="customer-table"
        columns={columns}
        rows={rows}
        filters={filters}
        exportHref="/api/export/customers"
        searchPlaceholder="회사명·대표자·담당자 검색"
        rowKey={(r) => r.id}
        primaryKey="name"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      {selected && (
        <CustomerModal
          key={selected.id}
          customer={selected}
          onUpdate={(patch) => update(selected.id, patch)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function CustomerModal({
  customer: c,
  onUpdate,
  onClose,
}: {
  customer: Row;
  onUpdate: (patch: Partial<Row>) => void;
  onClose: () => void;
}) {
  const extras = customerExtras(c);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ manager: c.manager, phone: c.phone, email: c.email });
  const [contractEditing, setContractEditing] = useState(false);
  const contractOf = (r: Row): ContractInfo => ({
    contractStart: r.contractStart, contractEnd: r.contractEnd, annualAmount: r.annualAmount, terms: r.terms,
  });
  const [contractDraft, setContractDraft] = useState<ContractInfo>(contractOf(c));
  const [contractError, setContractError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState("");

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    onUpdate({ notes: [{ date: today(), author: "admin", text }, ...c.notes] });
    setNoteText("");
    setMessage("상담 메모가 등록되었습니다.");
  }

  return (
    <Modal
      id="customer-modal"
      title={
        <>
          <span id="detail-name">{c.name}</span>{" "}
          <span
            id="detail-contract"
            className={`ml-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium ${badge[c.contract]}`}
          >
            {c.contract}
          </span>
        </>
      }
      subtitle={
        <>
          <span id="detail-id">{c.id}</span> · {c.industry} · {c.region}
        </>
      }
      onClose={onClose}
      footer={
        <>
          {!editing && (
            <button id="btn-edit" type="button" className={btnGhost} onClick={() => setEditing(true)}>
              담당자 정보 수정
            </button>
          )}
          <button id="btn-detail-close" type="button" className={btnPrimary} onClick={onClose}>
            닫기
          </button>
        </>
      }
    >
      {message && (
        <p id="detail-message" role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <Section title="기본 정보">
        <InfoGrid
          items={[
            { label: "대표자", value: c.ceo, id: "detail-ceo" },
            { label: "업종", value: c.industry, id: "detail-industry" },
            { label: "주소", value: c.address, id: "detail-address" },
          ]}
        />
      </Section>

      <Section title="담당자 정보">
        {editing ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="font-medium text-zinc-700">
              담당자
              <input
                id="edit-manager"
                name="manager"
                className={inputCls}
                value={draft.manager}
                onChange={(ev) => setDraft({ ...draft, manager: ev.target.value })}
              />
            </label>
            <label className="font-medium text-zinc-700">
              연락처
              <input
                id="edit-phone"
                name="phone"
                className={inputCls}
                value={draft.phone}
                onChange={(ev) => setDraft({ ...draft, phone: ev.target.value })}
              />
            </label>
            <label className="col-span-2 font-medium text-zinc-700">
              이메일
              <input
                id="edit-email"
                name="email"
                type="email"
                className={inputCls}
                value={draft.email}
                onChange={(ev) => setDraft({ ...draft, email: ev.target.value })}
              />
            </label>
            <div className="col-span-2 flex justify-end gap-2">
              <button
                id="btn-edit-cancel"
                type="button"
                className={btnGhost}
                onClick={() => {
                  setDraft({ manager: c.manager, phone: c.phone, email: c.email });
                  setEditing(false);
                }}
              >
                취소
              </button>
              <button
                id="btn-edit-save"
                type="button"
                className={btnPrimary}
                onClick={() => {
                  onUpdate(draft);
                  setEditing(false);
                  setMessage("담당자 정보가 수정되었습니다.");
                }}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <InfoGrid
            items={[
              { label: "담당자", value: c.manager, id: "detail-manager" },
              { label: "연락처", value: c.phone, id: "detail-phone" },
              { label: "이메일", value: c.email, id: "detail-email" },
            ]}
          />
        )}
      </Section>

      <Section title="계약 정보">
        {contractEditing ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="font-medium text-zinc-700">
              계약 시작일
              <input
                id="edit-contract-start"
                name="contractStart"
                placeholder="YYYY-MM-DD"
                className={inputCls}
                value={contractDraft.contractStart}
                onChange={(ev) => setContractDraft({ ...contractDraft, contractStart: ev.target.value })}
              />
            </label>
            <label className="font-medium text-zinc-700">
              계약 종료일
              <input
                id="edit-contract-end"
                name="contractEnd"
                placeholder="YYYY-MM-DD"
                className={inputCls}
                value={contractDraft.contractEnd}
                onChange={(ev) => setContractDraft({ ...contractDraft, contractEnd: ev.target.value })}
              />
            </label>
            <label className="font-medium text-zinc-700">
              연 계약금(원)
              <input
                id="edit-annual"
                name="annualAmount"
                inputMode="numeric"
                className={inputCls}
                value={String(contractDraft.annualAmount)}
                onChange={(ev) => setContractDraft({ ...contractDraft, annualAmount: Number(ev.target.value.replace(/[^0-9]/g, "")) })}
              />
            </label>
            <label className="font-medium text-zinc-700">
              결제조건
              <input
                id="edit-terms"
                name="terms"
                className={inputCls}
                value={contractDraft.terms}
                onChange={(ev) => setContractDraft({ ...contractDraft, terms: ev.target.value })}
              />
            </label>
            {contractError && (
              <p id="contract-error" role="alert" className="col-span-2 text-sm text-red-600">
                {contractError}
              </p>
            )}
            <div className="col-span-2 flex justify-end gap-2">
              <button
                id="btn-contract-cancel"
                type="button"
                className={btnGhost}
                onClick={() => {
                  setContractDraft(contractOf(c));
                  setContractError("");
                  setContractEditing(false);
                }}
              >
                취소
              </button>
              <button
                id="btn-contract-save"
                type="button"
                className={btnPrimary}
                onClick={() => {
                  const d = contractDraft;
                  const ymd = /^\d{4}-\d{2}-\d{2}$/;
                  if (!ymd.test(d.contractStart) || !ymd.test(d.contractEnd)) {
                    setContractError("날짜는 YYYY-MM-DD 형식으로 입력하세요.");
                    return;
                  }
                  if (d.contractEnd < d.contractStart) {
                    setContractError("계약 종료일은 시작일 이후여야 합니다.");
                    return;
                  }
                  if (!d.annualAmount || !d.terms.trim()) {
                    setContractError("연 계약금과 결제조건을 입력하세요.");
                    return;
                  }
                  onUpdate({ ...d, terms: d.terms.trim() });
                  setContractError("");
                  setContractEditing(false);
                  setMessage("계약 정보가 수정되었습니다.");
                }}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <InfoGrid
              items={[
                { label: "계약기간", value: `${c.contractStart} ~ ${c.contractEnd}`, id: "detail-period" },
                { label: "연 계약금", value: won(c.annualAmount), id: "detail-annual" },
                { label: "결제조건", value: c.terms, id: "detail-terms" },
              ]}
            />
            <button
              id="btn-contract-edit"
              type="button"
              className={`${btnGhost} mt-3`}
              onClick={() => {
                setContractDraft(contractOf(c));
                setContractEditing(true);
              }}
            >
              계약 정보 수정
            </button>
          </>
        )}
        <label className="mt-3 flex items-center gap-3 text-sm font-medium text-zinc-700">
          계약상태 변경
          <select
            id="detail-contract-select"
            name="contract"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm"
            value={c.contract}
            onChange={(ev) => {
              onUpdate({ contract: ev.target.value as Customer["contract"] });
              setMessage(`계약상태가 '${ev.target.value}'(으)로 변경되었습니다.`);
            }}
          >
            {CONTRACTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </Section>

      <Section title="최근 거래 내역">
        <table id="detail-order-table" className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-1 font-medium">주문번호</th>
              <th className="py-1 font-medium">일자</th>
              <th className="py-1 text-right font-medium">금액</th>
              <th className="py-1 pl-4 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {extras.orders.map((o) => (
              <tr key={o.no} className="border-t border-zinc-100">
                <td className="py-1.5">{o.no}</td>
                <td className="py-1.5">{o.date}</td>
                <td className="py-1.5 text-right tabular-nums">{won(o.amount)}</td>
                <td className="py-1.5 pl-4">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-right text-sm text-zinc-600">
          누적 거래액 <b id="detail-total-orders" className="text-cocoa-700">{won(extras.totalOrders)}</b>
        </p>
      </Section>

      <Section title="상담 메모">
        <div className="flex gap-2">
          <input
            id="note-text"
            name="note"
            className={`${inputCls} mt-0`}
            value={noteText}
            onChange={(ev) => setNoteText(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && addNote()}
            placeholder="상담 내용을 입력하세요"
          />
          <button id="btn-note-add" type="button" className={`${btnGhost} shrink-0`} onClick={addNote}>
            등록
          </button>
        </div>
        <ul id="detail-notes" className="mt-3 space-y-1.5 text-sm">
          {c.notes.map((n, i) => (
            <li key={i} className="flex gap-3 border-t border-zinc-100 pt-1.5">
              <span className="shrink-0 text-zinc-500">{n.date}</span>
              <span className="shrink-0 text-zinc-500">{n.author}</span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </Section>
    </Modal>
  );
}
