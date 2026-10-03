import ExcelJS from "exceljs";
import { employees } from "@/lib/data/employees";
import { customers } from "@/lib/data/customers";
import { buildOvertimeRequests } from "@/lib/data/overtime";
import { filterRows } from "@/lib/filter";

export const runtime = "nodejs";

type Column = { header: string; key: string; width: number };

const SHEETS: Record<
  string,
  {
    sheet: string;
    file: string;
    columns: Column[];
    rows: () => Record<string, unknown>[];
    filterKeys: string[];
  }
> = {
  employees: {
    sheet: "사원목록",
    file: "cocoa_employees.xlsx",
    filterKeys: ["department", "position", "status"],
    columns: [
      { header: "사번", key: "id", width: 12 },
      { header: "이름", key: "name", width: 12 },
      { header: "부서", key: "department", width: 14 },
      { header: "직급", key: "position", width: 10 },
      { header: "이메일", key: "email", width: 28 },
      { header: "연락처", key: "phone", width: 16 },
      { header: "입사일", key: "hireDate", width: 14 },
      { header: "상태", key: "status", width: 10 },
    ],
    rows: () => employees,
  },
  customers: {
    sheet: "고객사목록",
    file: "cocoa_customers.xlsx",
    filterKeys: ["industry", "contract", "region"],
    columns: [
      { header: "고객사코드", key: "id", width: 12 },
      { header: "회사명", key: "name", width: 24 },
      { header: "대표자", key: "ceo", width: 12 },
      { header: "업종", key: "industry", width: 12 },
      { header: "담당자", key: "manager", width: 12 },
      { header: "연락처", key: "phone", width: 16 },
      { header: "이메일", key: "email", width: 28 },
      { header: "주소", key: "address", width: 40 },
      { header: "계약상태", key: "contract", width: 10 },
    ],
    rows: () => customers,
  },
  overtime: {
    sheet: "초과신청목록",
    file: "cocoa_overtime.xlsx",
    filterKeys: ["date", "status", "category"],
    columns: [
      { header: "신청번호", key: "id", width: 16 },
      { header: "일자", key: "date", width: 12 },
      { header: "사번", key: "empId", width: 12 },
      { header: "신청자", key: "empName", width: 12 },
      { header: "부서", key: "department", width: 14 },
      { header: "업무구분", key: "category", width: 12 },
      { header: "시간", key: "time", width: 26 },
      { header: "총시간", key: "hours", width: 10 },
      { header: "업무명", key: "title", width: 24 },
      { header: "내용", key: "content", width: 50 },
      { header: "고객사", key: "customer", width: 20 },
      { header: "상태", key: "status", width: 10 },
      { header: "비고", key: "note", width: 36 },
    ],
    rows: () => buildOvertimeRequests(),
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const def = SHEETS[type];
  if (!def) return new Response("Not Found", { status: 404 });

  // 화면의 검색어·필터와 같은 조건(q, 필터 키)을 쿼리스트링으로 받아 적용한다.
  const sp = new URL(request.url).searchParams;
  const filters = Object.fromEntries(
    def.filterKeys.map((k) => [k, sp.get(k) ?? ""]).filter(([, v]) => v),
  );
  const rows = filterRows(
    def.rows(),
    sp.get("q") ?? "",
    filters,
    def.columns.map((c) => c.key),
  );

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(def.sheet);
  ws.columns = def.columns;
  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };
  const buffer = await wb.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${def.file}"`,
      "Cache-Control": "no-store",
    },
  });
}
