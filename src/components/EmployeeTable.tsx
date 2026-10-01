"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal, { InfoGrid, Section, btnGhost, btnPrimary, inputCls } from "@/components/Modal";
import { employees as seed, DEPARTMENTS, POSITIONS, type Employee } from "@/lib/data/employees";
import { employeeExtras } from "@/lib/data/details";

const columns: Column<Employee>[] = [
  { key: "id", header: "사번" },
  { key: "name", header: "이름" },
  { key: "department", header: "부서" },
  { key: "position", header: "직급" },
  { key: "email", header: "이메일" },
  { key: "phone", header: "연락처" },
  { key: "hireDate", header: "입사일" },
  { key: "status", header: "상태" },
];

const filters = [
  { key: "department" as const, label: "부서", options: DEPARTMENTS },
  { key: "position" as const, label: "직급", options: POSITIONS },
  { key: "status" as const, label: "상태", options: ["재직", "휴직"] },
];

export default function EmployeeTable() {
  // 수정 내용은 새로고침하면 초기화된다(실습 반복용).
  const [rows, setRows] = useState<Employee[]>(seed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  function update(id: string, patch: Partial<Employee>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <>
      <DataTable
        tableId="employee-table"
        columns={columns}
        rows={rows}
        filters={filters}
        exportHref="/api/export/employees"
        searchPlaceholder="이름·사번·이메일 검색"
        rowKey={(r) => r.id}
        primaryKey="name"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      {selected && (
        <EmployeeModal
          key={selected.id}
          employee={selected}
          onUpdate={(patch) => update(selected.id, patch)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function EmployeeModal({
  employee: e,
  onUpdate,
  onClose,
}: {
  employee: Employee;
  onUpdate: (patch: Partial<Employee>) => void;
  onClose: () => void;
}) {
  const extras = employeeExtras(e);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    department: e.department,
    position: e.position,
    email: e.email,
    phone: e.phone,
  });
  const [memo, setMemo] = useState(e.memo ?? "");
  const [message, setMessage] = useState("");

  const usedPct = Math.round((extras.used / extras.total) * 100);

  function save() {
    onUpdate(draft);
    setEditing(false);
    setMessage("사원 정보가 수정되었습니다.");
  }

  return (
    <Modal
      id="employee-modal"
      title={
        <>
          <span id="detail-name">{e.name}</span>{" "}
          <span
            id="detail-status"
            className={`ml-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium ${
              e.status === "재직" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {e.status}
          </span>
        </>
      }
      subtitle={
        <>
          <span id="detail-id">{e.id}</span> · {e.department} · {e.position}
        </>
      }
      onClose={onClose}
      footer={
        <>
          {!editing && (
            <>
              <button
                id="btn-toggle-status"
                type="button"
                className={btnGhost}
                onClick={() => {
                  const next = e.status === "재직" ? "휴직" : "재직";
                  onUpdate({ status: next });
                  setMessage(`상태가 '${next}'(으)로 변경되었습니다.`);
                }}
              >
                {e.status === "재직" ? "휴직 처리" : "재직 복귀"}
              </button>
              <button id="btn-edit" type="button" className={btnGhost} onClick={() => setEditing(true)}>
                정보 수정
              </button>
            </>
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
        {editing ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="font-medium text-zinc-700">
              부서
              <select
                id="edit-department"
                name="department"
                className={inputCls}
                value={draft.department}
                onChange={(ev) => setDraft({ ...draft, department: ev.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="font-medium text-zinc-700">
              직급
              <select
                id="edit-position"
                name="position"
                className={inputCls}
                value={draft.position}
                onChange={(ev) => setDraft({ ...draft, position: ev.target.value })}
              >
                {POSITIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="font-medium text-zinc-700">
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
            <div className="col-span-2 flex justify-end gap-2">
              <button
                id="btn-edit-cancel"
                type="button"
                className={btnGhost}
                onClick={() => {
                  setDraft({ department: e.department, position: e.position, email: e.email, phone: e.phone });
                  setEditing(false);
                }}
              >
                취소
              </button>
              <button id="btn-edit-save" type="button" className={btnPrimary} onClick={save}>
                저장
              </button>
            </div>
          </div>
        ) : (
          <InfoGrid
            items={[
              { label: "부서", value: e.department, id: "detail-department" },
              { label: "직급", value: e.position, id: "detail-position" },
              { label: "이메일", value: e.email, id: "detail-email" },
              { label: "연락처", value: e.phone, id: "detail-phone" },
              { label: "입사일", value: e.hireDate, id: "detail-hireDate" },
              { label: "근속", value: `${extras.years}년`, id: "detail-years" },
            ]}
          />
        )}
      </Section>

      <Section title="연차 현황">
        <div className="text-sm">
          <div className="mb-1.5 flex justify-between text-zinc-600">
            <span>
              총 <b id="leave-total">{extras.total}</b>일 · 사용 <b id="leave-used">{extras.used}</b>일
            </span>
            <span>
              잔여 <b id="leave-remain" className="text-cocoa-700">{extras.remain}</b>일
            </span>
          </div>
          <div className="h-2.5 rounded bg-cocoa-50">
            <div className="h-2.5 rounded bg-cocoa-500" style={{ width: `${usedPct}%` }} />
          </div>
        </div>
      </Section>

      <Section title="최근 휴가 이력">
        <table id="detail-leave-table" className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-1 font-medium">일자</th>
              <th className="py-1 font-medium">유형</th>
              <th className="py-1 font-medium">일수</th>
            </tr>
          </thead>
          <tbody>
            {extras.history.map((h, i) => (
              <tr key={i} className="border-t border-zinc-100">
                <td className="py-1.5">{h.date}</td>
                <td className="py-1.5">{h.type}</td>
                <td className="py-1.5">{h.days}일</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="인사 메모">
        <textarea
          id="detail-memo"
          name="memo"
          rows={3}
          className={inputCls}
          value={memo}
          onChange={(ev) => setMemo(ev.target.value)}
          placeholder="메모를 입력하세요"
        />
        <div className="mt-2 flex justify-end">
          <button
            id="btn-memo-save"
            type="button"
            className={btnGhost}
            onClick={() => {
              onUpdate({ memo });
              setMessage("메모가 저장되었습니다.");
            }}
          >
            메모 저장
          </button>
        </div>
      </Section>
    </Modal>
  );
}
