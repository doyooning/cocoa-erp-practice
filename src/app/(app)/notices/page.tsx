import Link from "next/link";
import { notices } from "@/lib/data/notices";
import ImportantBadge from "@/components/ImportantBadge";

export default function NoticesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-cocoa-900">공지사항</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table id="notice-table" className="w-full text-sm">
          <thead className="bg-cocoa-50 text-left text-cocoa-700">
            <tr>
              <th className="px-3 py-2.5 font-semibold">번호</th>
              <th className="px-3 py-2.5 font-semibold">제목</th>
              <th className="px-3 py-2.5 font-semibold">작성자</th>
              <th className="px-3 py-2.5 font-semibold">작성일</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n) => (
              <tr
                key={n.id}
                id={`notice-row-${n.id}`}
                className={`border-t border-zinc-100 hover:bg-cocoa-50/50 ${
                  n.important ? "bg-red-50/60" : ""
                }`}
              >
                <td className="px-3 py-2">{n.id}</td>
                <td className="px-3 py-2">
                  {n.important && <ImportantBadge />}
                  <Link href={`/notices/${n.id}`} className="align-middle hover:underline">
                    {n.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{n.author}</td>
                <td className="whitespace-nowrap px-3 py-2">{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
