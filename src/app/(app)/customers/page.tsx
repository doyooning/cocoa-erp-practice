import DataTable, { type Column } from "@/components/DataTable";
import { customers, type Customer } from "@/lib/data/customers";

const columns: Column<Customer>[] = [
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

export default function CustomersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">고객사관리</h1>
      <DataTable
        tableId="customer-table"
        columns={columns}
        rows={customers}
        exportHref="/api/export/customers"
        searchPlaceholder="회사명·대표자·업종 검색"
      />
    </div>
  );
}
