import DataTable, { type Column } from "@/components/DataTable";
import { employees, type Employee } from "@/lib/data/employees";

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

export default function EmployeesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">사원관리</h1>
      <DataTable
        tableId="employee-table"
        columns={columns}
        rows={employees}
        exportHref="/api/export/employees"
        searchPlaceholder="이름·부서·직급 검색"
      />
    </div>
  );
}
