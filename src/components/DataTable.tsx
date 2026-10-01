"use client";

import { useMemo, useState } from "react";

export type Column<T> = { key: keyof T & string; header: string };

type Props<T> = {
  tableId: string;
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  exportHref?: string;
  searchPlaceholder?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  tableId,
  columns,
  rows,
  pageSize = 10,
  exportHref,
  searchPlaceholder = "검색어 입력",
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      columns.some((c) => String(r[c.key]).toLowerCase().includes(q)),
    );
  }, [rows, columns, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const btn =
    "min-w-8 rounded border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
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
        <div className="flex items-center gap-3">
          <span id={`${tableId}-total`} className="text-sm text-zinc-600">
            총 {filtered.length}건
          </span>
          {exportHref && (
            <a
              id="btn-export-excel"
              href={exportHref}
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
            {pageRows.map((r, i) => (
              <tr key={start + i} className="border-t border-zinc-100 hover:bg-cocoa-50/50">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-3 py-2">
                    {String(r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
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
