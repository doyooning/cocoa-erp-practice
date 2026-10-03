import Link from "next/link";
import { notFound } from "next/navigation";
import { notices } from "@/lib/data/notices";
import ImportantBadge from "@/components/ImportantBadge";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = notices.find((n) => String(n.id) === id);
  if (!notice) notFound();

  return (
    <article className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-6">
      <h1 id="notice-title" className="text-xl font-bold text-cocoa-900">
        {notice.important && <ImportantBadge />}
        {notice.title}
      </h1>
      <div className="mt-2 flex gap-4 text-sm text-zinc-500">
        <span id="notice-author">{notice.author}</span>
        <span id="notice-date">{notice.date}</span>
      </div>
      <p id="notice-body" className="mt-6 leading-relaxed text-zinc-800">
        {notice.body}
      </p>
      <Link href="/notices" className="mt-8 inline-block text-sm text-cocoa-500 hover:underline">
        ← 목록으로
      </Link>
    </article>
  );
}
