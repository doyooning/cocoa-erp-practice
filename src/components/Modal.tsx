"use client";

import { useEffect } from "react";

type Props = {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ id, title, subtitle, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      id={id}
      data-testid={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 id={`${id}-title`} className="text-lg font-bold text-cocoa-900">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
          </div>
          <button
            id={`${id}-x`}
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="rounded p-1 text-xl leading-none text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            ×
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-cocoa-700">{title}</h3>
      {children}
    </section>
  );
}

export function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; id?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {items.map((it) => (
        <div key={it.label} className="flex gap-3">
          <dt className="w-16 shrink-0 text-zinc-500">{it.label}</dt>
          <dd id={it.id} className="min-w-0 break-words text-zinc-900">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export const inputCls = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";
export const btnPrimary =
  "rounded-md bg-cocoa-600 px-4 py-2 text-sm font-medium text-white hover:bg-cocoa-700 disabled:opacity-50";
export const btnGhost =
  "rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50";
