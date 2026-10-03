import LeaveTable from "@/components/LeaveTable";
import { buildLeaves } from "@/lib/data/leaves";

// 휴가 기간을 "오늘" 기준으로 만들기 때문에 빌드 시점에 고정되지 않도록 한다.
export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-cocoa-900">근태/휴가</h1>
      <p className="mb-6 text-sm text-zinc-500">
        직원이 올린 휴가 신청을 조회하고 승인 또는 반려합니다. 처리는 상세 모달에서만 할 수 있습니다.
      </p>
      <LeaveTable initialRows={buildLeaves()} />
    </div>
  );
}
