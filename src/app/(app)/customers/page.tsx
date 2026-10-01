import CustomerTable from "@/components/CustomerTable";

export default function CustomersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">고객사관리</h1>
      <CustomerTable />
    </div>
  );
}
