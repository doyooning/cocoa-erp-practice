"use client";

import { useMemo, useState } from "react";
import { filterRows } from "@/lib/filter";

export type Column<T> = { key: keyof T & string; header: string; className?: string };

export type FilterDef<T> = { key: keyof T & string; label: string; options: string[] };

/** 날짜 컬럼(yyyy-MM-dd)을 날짜 입력으로 걸러낸다. */
export type DateFilterDef<T> = { key: keyof T & string; label: string };

type Props<T> = {
  tableId: string;
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  exportHref?: string;
  searchPlaceholder?: string;
  filters?: FilterDef<T>[];
  dateFilters?: DateFilterDef<T>[];
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** 이 컬럼의 값은 버튼으로 렌더링해 키보드로도 상세를 열 수 있게 한다. */
  primaryKey?: keyof T & string;
};

export default function DataTable<T extends Record<string, unknown>>({
  tableId,
  columns,
  rows,
  pageSize = 10,
  exportHref,
  searchPlaceholder = "검색어 입력",
  filters = [],
  dateFilters = [],
  rowKey,
  onRowClick,
  primaryKey,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(values).filter(([, v]) => v)),
    [values],
  );

  const filtered = useMemo(
    () =>
      filterRows(
        rows,
        query,
        activeFilters,
        columns.map((c) => c.key),
      ),
    [rows, columns, query, activeFilters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const hasFilter = query.trim() !== "" || Object.keys(activeFilters).length > 0;

  // 엑셀 내보내기도 현재 검색·필터 결과와 같은 조건으로 내려받는다.
  const exportUrl = useMemo(() => {
    if (!exportHref) return "";
    const p = new URLSearchParams(activeFilters);
    if (query.trim()) p.set("q", query.trim());
    const qs = p.toString();
    return qs ? `${exportHref}?${qs}` : exportHref;
  }, [exportHref, activeFilters, query]);

  const btn =
    "min-w-8 rounded border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40";
  const select = "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          id={`${tableId}-search`}
          name="search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="w-64 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
        {dateFilters.map((f) => (
          <input
            key={f.key}
            id={`filter-${f.key}`}
            name={f.key}
            type="date"
            aria-label={f.label}
            value={values[f.key] ?? ""}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }));
              setPage(1);
            }}
            className={select}
          />
        ))}
        {filters.map((f) => (
          <select
            key={f.key}
            id={`filter-${f.key}`}
            name={f.key}
            aria-label={f.label}
            value={values[f.key] ?? ""}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }));
              setPage(1);
            }}
            className={select}
          >
            <option value="">{f.label} 전체</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        {filters.length + dateFilters.length > 0 && (
          <button
            id="btn-filter-reset"
            type="button"
            disabled={!hasFilter}
            onClick={() => {
              setQuery("");
              setValues({});
              setPage(1);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            초기화
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span id={`${tableId}-total`} className="text-sm text-zinc-600">
            총 {filtered.length}건
          </span>
          {exportHref && (
            <a
              id="btn-export-excel"
              href={exportUrl}
              download
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              엑셀로 다운로드
            </a>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table id={tableId} data-testid={tableId} className="w-full text-sm">
          <thead className="bg-cocoa-50 text-left text-cocoa-700">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => {
              const key = rowKey ? rowKey(r) : String(start + i);
              return (
                <tr
                  key={key}
                  id={rowKey ? `row-${key}` : undefined}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  className={`border-t border-zinc-100 hover:bg-cocoa-50/50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-3 py-2 ${c.className ?? "whitespace-nowrap"}`}>
                      {c.key === primaryKey ? (
                        <button type="button" className="font-medium text-cocoa-600 hover:underline">
                          {String(r[c.key])}
                        </button>
                      ) : (
                        String(r[c.key])
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-zinc-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav
        id={`${tableId}-pagination`}
        aria-label="페이지 이동"
        className="mt-4 flex items-center justify-center gap-1"
      >
        <button
          id="btn-prev"
          type="button"
          className={btn}
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            id={`page-${n}`}
            type="button"
            aria-current={n === current ? "page" : undefined}
            className={`${btn} ${
              n === current ? "border-cocoa-600 bg-cocoa-600 text-white" : "bg-white"
            }`}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          id="btn-next"
          type="button"
          className={btn}
          disabled={current === totalPages}
          onClick={() => setPage(current + 1)}
        >
          다음
        </button>
      </nav>
    </div>
  );
}
