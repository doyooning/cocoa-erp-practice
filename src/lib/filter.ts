// 표 화면(DataTable)과 엑셀 내보내기 API가 같은 규칙으로 걸러내도록 공용으로 둔다.
export function filterRows<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  filters: Record<string, string>,
  searchKeys: string[],
): T[] {
  const needle = query.trim().toLowerCase();
  return rows.filter(
    (r) =>
      Object.entries(filters).every(([k, v]) => !v || String(r[k]) === v) &&
      (!needle || searchKeys.some((k) => String(r[k]).toLowerCase().includes(needle))),
  );
}
