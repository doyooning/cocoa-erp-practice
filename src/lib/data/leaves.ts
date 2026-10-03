import { createRng, fmtDate, int, pick } from "../random";
import { employees } from "./employees";

export type LeaveStatus = "신청" | "승인" | "반려";

export type Leave = {
  no: number;
  employee: string;
  department: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  note: string;
};

export const LEAVE_TYPES = ["연차", "반차", "병가", "경조사", "공가"];
export const LEAVE_STATUSES: LeaveStatus[] = ["신청", "승인", "반려"];

const REASONS: Record<string, string[]> = {
  연차: ["개인 사정", "가족 여행", "휴식", "이사"],
  반차: ["은행 업무", "병원 진료", "자녀 학교 행사", "관공서 방문"],
  병가: ["병원 진료", "입원 치료", "건강 검진"],
  경조사: ["결혼식 참석", "조부모상", "자녀 돌잔치"],
  공가: ["예비군 훈련", "민방위 교육", "법정 교육"],
};

const REJECT_REASONS = [
  "동일 기간에 팀 필수 인력이 부족합니다.",
  "잔여 연차가 부족합니다.",
  "증빙 서류가 첨부되지 않았습니다.",
  "마감 일정과 겹쳐 일정 조정이 필요합니다.",
];

/** 서버와 브라우저가 같은 날짜를 쓰도록 한국 시간 기준으로 오늘을 구한다. */
function todayKST(): Date {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 휴가 신청 내역을 만든다. 오늘을 기준으로 과거 20일 ~ 향후 20일에 걸쳐 생성하므로
 * 서버에서만 호출하고 결과를 클라이언트에 props로 넘긴다(하이드레이션 불일치 방지).
 */
export function buildLeaves(): Leave[] {
  const rng = createRng(20260404);
  const base = todayKST();
  const working = employees.filter((e) => e.status === "재직");
  const list: Leave[] = [];

  for (let i = 0; i < 45; i++) {
    const emp = pick(rng, working);
    const type = pick(rng, LEAVE_TYPES);
    const offset = int(rng, -20, 20);
    const from = new Date(base);
    from.setDate(from.getDate() + offset);
    // 반차·공가는 하루, 연차는 최대 사흘
    const days = type === "반차" ? 0.5 : type === "공가" ? 1 : int(rng, 1, 3);
    const to = new Date(from);
    to.setDate(to.getDate() + Math.max(0, Math.ceil(days) - 1));

    // 지난 날짜는 대부분 처리가 끝나 있고, 앞으로의 신청은 대기 비중이 높다.
    const r = rng();
    const status: LeaveStatus =
      offset < 0 ? (r < 0.8 ? "승인" : r < 0.95 ? "반려" : "신청") : r < 0.55 ? "신청" : r < 0.88 ? "승인" : "반려";

    list.push({
      no: i + 1,
      employee: emp.name,
      department: emp.department,
      type,
      from: fmtDate(from),
      to: fmtDate(to),
      days,
      reason: pick(rng, REASONS[type]),
      status,
      note: status === "반려" ? pick(rng, REJECT_REASONS) : "",
    });
  }

  // 시작일이 늦은 신청이 위로 오게 한다.
  return list.sort((a, b) => b.from.localeCompare(a.from) || b.no - a.no);
}
