import { createRng, fmtDate, int, pad, pick } from "../random";
import type { Employee } from "./employees";
import type { Customer } from "./customers";

// 상세 모달에 보여줄 파생 데이터. id로 시드를 만들어 항상 같은 값이 나온다.
const TODAY = new Date(2026, 9, 1);

function seeded(id: string) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return createRng(h >>> 0);
}

export type LeaveRecord = { date: string; type: string; days: number };

export function employeeExtras(e: Employee) {
  const rng = seeded(e.id);
  const hire = new Date(e.hireDate);
  const years = Math.floor((TODAY.getTime() - hire.getTime()) / (365.25 * 86400000));
  const total = Math.min(25, 15 + Math.floor(years / 2));
  const used = int(rng, 0, total - 2);
  const history: LeaveRecord[] = Array.from({ length: 3 }, () => ({
    date: fmtDate(new Date(2026, int(rng, 0, 8), int(rng, 1, 28))),
    type: pick(rng, ["연차", "반차", "병가", "경조사"]),
    days: pick(rng, [0.5, 1, 1, 2]),
  })).sort((a, b) => b.date.localeCompare(a.date));
  return { years, total, used, remain: total - used, history };
}

export type OrderRecord = { no: string; date: string; amount: number; status: string };
export type Note = { date: string; author: string; text: string };

const TERMS = ["월말 마감 / 익월 15일 지급", "선금 30% / 잔금 70%", "납품 후 30일 이내 지급", "분기 정산"];
const NOTE_TEXTS = ["신규 단가표 전달, 검토 후 회신 예정", "납기 일정 조율 요청", "분기 재계약 조건 협의", "담당자 변경 안내 수신", "견적서 재발송 요청"];
const AUTHORS = ["김하은", "이도현", "박서윤", "최지안"];

export function customerExtras(c: Customer) {
  const rng = seeded(c.id);
  const startYear = 2022 + int(rng, 0, 3);
  const start = new Date(startYear, int(rng, 0, 11), 1);
  const end = new Date(startYear + 2, start.getMonth(), 0);
  const orders: OrderRecord[] = Array.from({ length: 4 }, (_, i) => ({
    no: `ORD-${c.id.slice(3)}-${pad(i + 1)}`,
    date: fmtDate(new Date(2026, int(rng, 3, 8), int(rng, 1, 28))),
    amount: int(rng, 20, 400) * 100000,
    status: pick(rng, ["납품완료", "납품완료", "진행중", "입금대기"]),
  })).sort((a, b) => b.date.localeCompare(a.date));
  const notes: Note[] = Array.from({ length: 2 }, () => ({
    date: fmtDate(new Date(2026, int(rng, 6, 8), int(rng, 1, 28))),
    author: pick(rng, AUTHORS),
    text: pick(rng, NOTE_TEXTS),
  })).sort((a, b) => b.date.localeCompare(a.date));
  return {
    contractStart: fmtDate(start),
    contractEnd: fmtDate(end),
    annualAmount: int(rng, 5, 50) * 10000000,
    terms: pick(rng, TERMS),
    orders,
    totalOrders: orders.reduce((s, o) => s + o.amount, 0),
    notes,
  };
}
