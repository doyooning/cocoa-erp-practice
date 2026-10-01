import ExcelJS from "exceljs";
import { employees } from "@/lib/data/employees";
import { customers } from "@/lib/data/customers";

export const runtime = "nodejs";

type Column = { header: string; key: string; width: number };

const SHEETS: Record<
  string,
  { sheet: string; file: string; columns: Column[]; rows: Record<string, unknown>[] }
> = {
  employees: {
    sheet: "사원목록",
    file: "cocoa_employees.xlsx",
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
    rows: employees,
  },
  customers: {
    sheet: "고객사목록",
    file: "cocoa_customers.xlsx",
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
    rows: customers,
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const def = SHEETS[type];
  if (!def) return new Response("Not Found", { status: 404 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(def.sheet);
  ws.columns = def.columns;
  ws.addRows(def.rows);
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
