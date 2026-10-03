import { createRng, fmtDate, int, pad, pick } from "../random";
import { employees } from "./employees";
import { customers } from "./customers";

export type OvertimeStatus = "승인대기" | "승인완료" | "반려";

export type Overtime = {
  id: string;
  date: string;
  empId: string;
  empName: string;
  department: string;
  category: string;
  /** 표에 보여줄 "18:30 ~ 21:00 (총 2.5시간)" 형태의 문자열 */
  time: string;
  startTime: string;
  endTime: string;
  hours: number;
  title: string;
  content: string;
  customer: string;
  status: OvertimeStatus;
  note: string;
};

export const OT_CATEGORIES = ["고객대응", "개발", "본사업무", "운영", "마케팅", "기타"];
export const OT_STATUSES: OvertimeStatus[] = ["승인대기", "승인완료", "반려"];

const TASKS: Record<string, { title: string; content: string }[]> = {
  고객대응: [
    { title: "고객사 장애 대응", content: "운영 중 발생한 조회 지연 장애를 고객사 담당자와 함께 확인하고 임시 조치했습니다." },
    { title: "요구사항 추가 협의", content: "다음 스프린트에 반영할 추가 요구사항을 정리하고 일정 영향도를 검토했습니다." },
    { title: "정기 점검 지원", content: "고객사 정기 점검 일정에 맞춰 원격으로 점검을 지원했습니다." },
    { title: "오픈 현장 지원", content: "서비스 오픈 당일 현장에 상주하며 접수 오류를 처리했습니다." },
  ],
  개발: [
    { title: "배포 스크립트 수정", content: "배포 중 중단되는 문제를 수정하고 스테이징에서 재검증했습니다." },
    { title: "결재 모듈 기능 개발", content: "결재선 자동 지정 기능을 구현하고 단위 테스트를 추가했습니다." },
    { title: "쿼리 성능 개선", content: "사원 목록 조회 쿼리에 인덱스를 추가해 응답 시간을 단축했습니다." },
    { title: "긴급 패치 적용", content: "운영 반영된 계산 오류를 수정해 긴급 패치로 배포했습니다." },
  ],
  본사업무: [
    { title: "월말 결산 자료 정리", content: "월말 결산용 비용 집행 내역을 정리해 재무팀에 전달했습니다." },
    { title: "내부 감사 자료 준비", content: "내부 감사 요청 자료를 부서별로 취합하고 누락분을 보완했습니다." },
    { title: "채용 서류 검토", content: "경력 채용 서류를 검토하고 면접 대상자를 선정했습니다." },
    { title: "사내 교육 자료 작성", content: "신규 입사자 온보딩 교육 자료를 작성했습니다." },
  ],
  운영: [
    { title: "야간 배치 모니터링", content: "야간 배치 작업을 모니터링하며 실패 건을 재처리했습니다." },
    { title: "서버 점검", content: "정기 서버 점검을 수행하고 디스크 용량을 확보했습니다." },
    { title: "데이터 이관 작업", content: "구 시스템 데이터를 신규 스키마로 이관하고 건수를 대조했습니다." },
    { title: "모니터링 알림 정비", content: "과도하게 발생하는 알림 조건을 조정했습니다." },
  ],
  마케팅: [
    { title: "프로모션 페이지 검수", content: "신규 프로모션 랜딩 페이지 문구와 링크를 검수했습니다." },
    { title: "캠페인 성과 분석", content: "지난주 캠페인 유입 데이터를 집계해 보고서를 작성했습니다." },
    { title: "전시회 부스 준비", content: "전시회 부스 배치와 홍보물 수량을 확정했습니다." },
    { title: "콘텐츠 촬영 입회", content: "제품 홍보 콘텐츠 촬영에 입회해 컨펌을 진행했습니다." },
  ],
  기타: [
    { title: "사무실 이전 지원", content: "사무실 이전에 따른 장비 이동과 네트워크 연결을 지원했습니다." },
    { title: "문서 아카이빙", content: "보존 기간이 지난 문서를 분류해 폐기 목록을 작성했습니다." },
    { title: "비품 재고 조사", content: "분기 비품 재고를 실사하고 차이 내역을 정리했습니다." },
    { title: "타 부서 업무 지원", content: "인력이 부족한 부서의 단순 반복 업무를 지원했습니다." },
  ],
};

const REJECT_REASONS = [
  "사전 승인 없이 진행된 초과 업무입니다.",
  "업무 내용이 구체적으로 기재되지 않았습니다.",
  "정규 근무시간 내 처리 가능한 업무로 판단됩니다.",
  "신청 시간과 실제 근무 기록이 일치하지 않습니다.",
  "동일 건이 중복 신청되었습니다.",
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

/** 오늘부터 과거로 거슬러 평일 n일을 모아 오래된 날짜순으로 돌려준다. */
function recentWeekdays(n: number): Date[] {
  const days: Date[] = [];
  const cur = todayKST();
  while (days.length < n) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() - 1);
  }
  return days.reverse();
}

export function fmtHours(h: number) {
  return Number.isInteger(h) ? String(h) : h.toFixed(1);
}

/**
 * 신청 목록을 만든다. "오늘" 기준으로 최근 평일 7일치를 생성하므로
 * 서버에서만 호출하고 결과를 클라이언트에 props로 넘긴다(하이드레이션 불일치 방지).
 */
export function buildOvertimeRequests(): Overtime[] {
  const rng = createRng(20260303);
  const active = customers.filter((c) => c.contract === "계약중");
  const working = employees.filter((e) => e.status === "재직");
  const days = recentWeekdays(7);
  const list: Overtime[] = [];

  days.forEach((day, dayIdx) => {
    const isRecent = dayIdx >= days.length - 2; // 최근 2일은 아직 미처리 상태로 둔다
    const count = int(rng, 10, 15);
    for (let i = 0; i < count; i++) {
      const emp = pick(rng, working);
      const category = pick(rng, OT_CATEGORIES);
      const task = pick(rng, TASKS[category]);
      const startMin = 18 * 60 + int(rng, 0, 4) * 30;
      const hours = int(rng, 2, 8) * 0.5;
      const endMin = startMin + hours * 60;
      const hhmm = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

      let status: OvertimeStatus = "승인대기";
      if (!isRecent) {
        const r = rng();
        status = r < 0.78 ? "승인완료" : r < 0.92 ? "반려" : "승인대기";
      }

      const date = fmtDate(day);
      list.push({
        id: `OT${date.replace(/-/g, "")}-${pad(i + 1)}`,
        date,
        empId: emp.id,
        empName: emp.name,
        department: emp.department,
        category,
        time: `${hhmm(startMin)} ~ ${hhmm(endMin)} (총 ${fmtHours(hours)}시간)`,
        startTime: hhmm(startMin),
        endTime: hhmm(endMin),
        hours,
        title: task.title,
        content: task.content,
        customer: category === "본사업무" ? "-" : pick(rng, active).name,
        status,
        note: status === "반려" ? pick(rng, REJECT_REASONS) : "",
      });
    }
  });

  // 최근 신청 건이 위로 오도록 정렬한다.
  return list.reverse();
}
