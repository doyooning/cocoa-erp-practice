"use client";

import { useState, useSyncExternalStore } from "react";
import { NOTICE_HIDE_KEY } from "@/lib/auth";

const SEEN_KEY = "cocoa_notice_seen";

function subscribe() {
  return () => {};
}

// 서버/하이드레이션 중에는 숨김, 클라이언트에서만 저장소를 읽는다.
function readSuppressed() {
  try {
    return (
      localStorage.getItem(NOTICE_HIDE_KEY) === "1" ||
      sessionStorage.getItem(SEEN_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export default function NoticeModal() {
  const suppressed = useSyncExternalStore(subscribe, readSuppressed, () => true);
  const [closed, setClosed] = useState(false);

  if (suppressed || closed) return null;

  function close(hideToday: boolean) {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
      if (hideToday) localStorage.setItem(NOTICE_HIDE_KEY, "1");
    } catch {
      // 저장소를 못 써도 모달은 닫는다
    }
    setClosed(true);
  }

  return (
    <div
      id="notice-modal"
      data-testid="notice-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="notice-modal-title" className="text-lg font-bold text-cocoa-900">
          시스템 점검 안내
        </h2>
        <div className="mt-3 space-y-1 text-sm leading-relaxed text-zinc-700">
          <p>안정적인 서비스 제공을 위해 아래 일정으로 시스템 점검이 진행됩니다.</p>
          <p className="font-medium">일시: 2026-10-05(일) 02:00 ~ 06:00</p>
          <p>점검 시간 동안 코코아 ERP 접속이 제한됩니다.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            id="btn-hide-today"
            type="button"
            onClick={() => close(true)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            오늘은 그만 보기
          </button>
          <button
            id="btn-confirm"
            type="button"
            onClick={() => close(false)}
            className="rounded-md bg-cocoa-600 px-4 py-2 text-sm font-medium text-white hover:bg-cocoa-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
