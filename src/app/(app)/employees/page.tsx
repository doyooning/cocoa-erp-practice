import EmployeeTable from "@/components/EmployeeTable";

export default function EmployeesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">사원관리</h1>
      <EmployeeTable />
    </div>
  );
}
