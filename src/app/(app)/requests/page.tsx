import RequestBoard from "@/components/RequestBoard";
import { buildRequests } from "@/lib/data/requests";

// 작성시간을 "지금" 기준으로 만들기 때문에 빌드 시점에 고정되지 않도록 한다.
export const dynamic = "force-dynamic";

export default function RequestsPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-cocoa-900">요청사항</h1>
      <p className="mb-6 text-sm text-zinc-500">
        직원이 본사에 올린 요청 게시물입니다. 게시물을 열어 내용을 확인하고 답글을 등록할 수 있습니다.
      </p>
      <RequestBoard initialRows={buildRequests()} />
    </div>
  );
}
