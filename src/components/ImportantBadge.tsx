/** 중요 공지 표시. 목록·상세·대시보드에서 같은 모양으로 쓴다. */
export default function ImportantBadge() {
  return (
    <span
      data-important="true"
      className="mr-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 align-middle text-xs font-semibold text-white"
    >
      🚨 중요
    </span>
  );
}
