import { createRng, int, pad, pick } from "../random";
import { employees } from "./employees";

export type RequestStatus = "답변대기" | "답변완료";

export type Request = {
  id: string;
  employee: string;
  department: string;
  /** YY.MM.dd hh:mm */
  createdAt: string;
  title: string;
  content: string;
  status: RequestStatus;
  reply: string;
  repliedAt: string;
};

/**
 * 요청 내용. 일부러 "바로 처리해야 하는 건"과 "일상적인 건"을 섞어 두었다.
 * 긴급/일반 구분은 사이트에 저장하지 않는다 — 자동화에서 AI가 내용을 읽고 판단하는 것이 실습 목적이다.
 */
const TOPICS: { title: string; content: string }[] = [
  { title: "사내 그룹웨어 접속 불가", content: "오전 9시부터 그룹웨어에 접속되지 않습니다. 팀원 전원 동일 증상이며 결재 상신이 막혀 있습니다. 확인 부탁드립니다." },
  { title: "고객사 납품 일정 지연 건", content: "금일 출고 예정이던 물량이 창고 시스템 오류로 나가지 못했습니다. 고객사에서 계약 위반을 언급하고 있어 즉시 대응이 필요합니다." },
  { title: "급여 명세서 금액 누락", content: "이번 달 급여에서 야근 수당 3회분이 빠져 있습니다. 확인 후 정정 부탁드립니다." },
  { title: "사무실 누수 발생", content: "3층 회의실 천장에서 물이 새고 있습니다. 바닥에 전원 멀티탭이 있어 위험합니다. 긴급 점검 요청합니다." },
  { title: "보안 메일 의심 신고", content: "거래처를 사칭한 메일에 첨부파일이 있어 열지 않고 신고합니다. 동일 메일이 팀 전체에 발송된 것으로 보입니다." },
  { title: "출입카드 분실", content: "어제 퇴근길에 출입카드를 분실했습니다. 기존 카드 사용 정지와 재발급 부탁드립니다." },
  { title: "노트북 전원 불량", content: "업무용 노트북이 충전되지 않아 오늘 오후부터 사용이 어렵습니다. 대여 장비가 있을까요?" },
  { title: "비품 요청 (모니터 받침대)", content: "장시간 모니터 작업으로 목 통증이 있어 모니터 받침대를 신청합니다." },
  { title: "회의실 예약 규정 문의", content: "소회의실을 주 단위로 반복 예약하는 방법이 있는지 궁금합니다." },
  { title: "주차 등록 차량 변경", content: "차량을 바꿔서 주차 등록 정보를 변경하고 싶습니다. 필요한 서류를 알려주세요." },
  { title: "교육비 지원 절차 문의", content: "외부 데이터 분석 교육을 수강하려 합니다. 지원 한도와 신청 시기를 알고 싶습니다." },
  { title: "사내 카페 메뉴 건의", content: "디카페인 옵션이 있으면 좋겠습니다. 오후에 카페인을 피하는 직원이 많습니다." },
  { title: "휴가 이월 가능 여부", content: "올해 잔여 연차를 내년으로 이월할 수 있는지 문의드립니다." },
  { title: "좌석 이동 요청", content: "현재 자리가 복도 쪽이라 소음이 심합니다. 창가 쪽으로 이동이 가능할까요?" },
  { title: "경조사 지원 신청 양식", content: "경조사 지원 신청서 최신 양식을 어디서 받을 수 있는지 알려주세요." },
  { title: "사내 메신저 알림 설정", content: "퇴근 후에도 알림이 와서 설정을 바꾸고 싶습니다. 가이드가 있을까요?" },
  { title: "복합기 토너 교체 요청", content: "2층 복합기 토너가 떨어져 출력이 되지 않습니다." },
  { title: "건강검진 일정 변경", content: "지정된 검진일에 출장이 있어 일정을 변경하고 싶습니다." },
  { title: "명함 추가 제작", content: "명함이 소진되어 200매 추가 제작 요청드립니다." },
  { title: "VPN 접속 오류", content: "재택 근무 중 VPN 2단계 인증이 계속 실패합니다. 오늘 마감 업무가 있어 빠른 확인 부탁드립니다." },
  { title: "사내 시스템 권한 요청", content: "신규 프로젝트 투입으로 고객사관리 메뉴 조회 권한이 필요합니다." },
  { title: "식대 정산 기준 문의", content: "야근 식대 정산 기준 금액이 변경되었는지 확인 부탁드립니다." },
  { title: "장애인 주차구역 무단 주차", content: "지하 1층 장애인 주차구역에 무단 주차가 반복되고 있습니다. 안내 조치가 필요합니다." },
  { title: "사무용품 정기 배송 요청", content: "팀 단위로 매월 볼펜과 포스트잇을 일괄 신청할 수 있을까요?" },
  { title: "전산 장비 반납 절차", content: "퇴사 예정자의 노트북과 모니터 반납 절차를 알고 싶습니다." },
  { title: "엘리베이터 고장", content: "오전부터 2호기 엘리베이터가 멈춰 있습니다. 이용객이 갇힐 수 있어 즉시 점검이 필요합니다." },
  { title: "사내 동호회 지원금 문의", content: "동호회 활동비 지원 신청 기간과 한도를 알려주세요." },
  { title: "재택근무 신청 방법", content: "주 1회 재택근무를 신청하려면 어떤 절차를 거쳐야 하는지 문의드립니다." },
  { title: "개인정보 유출 의심", content: "고객 명단이 담긴 파일이 외부 공유 링크로 열람 가능한 상태입니다. 즉시 차단이 필요합니다." },
  { title: "사내 교육 자료 공유 요청", content: "지난주 보안 교육 자료를 다시 받을 수 있을까요? 메일을 찾지 못했습니다." },
];

const REPLIES = [
  "확인 후 조치했습니다. 추가 문제가 있으면 다시 알려주세요.",
  "담당 부서에 전달했으며 이번 주 내로 처리될 예정입니다.",
  "요청하신 내용은 사내 규정상 별도 신청서가 필요합니다. 양식을 메일로 보내드렸습니다.",
  "접수 완료했습니다. 처리 일정은 개별 안내드리겠습니다.",
  "현재 검토 중이며 결과가 나오는 대로 회신드리겠습니다.",
];

/** 서버와 브라우저가 같은 날짜를 쓰도록 한국 시간 기준으로 지금을 구한다. */
export function nowKST(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return new Date(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
}

/** YY.MM.dd hh:mm */
export function fmtStamp(d: Date) {
  return `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 요청 게시물을 만든다. "지금"을 기준으로 최근 10일치를 생성하므로
 * 서버에서만 호출하고 결과를 클라이언트에 props로 넘긴다(하이드레이션 불일치 방지).
 */
export function buildRequests(): Request[] {
  const rng = createRng(20260505);
  const base = nowKST();
  const working = employees.filter((e) => e.status === "재직");

  const list = TOPICS.map((topic, i) => {
    const emp = pick(rng, working);
    const created = new Date(base);
    created.setDate(created.getDate() - int(rng, 0, 9));
    created.setHours(int(rng, 8, 19), int(rng, 0, 59), 0, 0);
    // 오늘 글이 아직 오지 않은 시각으로 찍히지 않게 현재 시각 이전으로 당긴다.
    if (created > base) created.setTime(base.getTime() - int(rng, 10, 120) * 60000);

    const answered = rng() < 0.35;
    const replied = new Date(created);
    replied.setHours(replied.getHours() + int(rng, 1, 30));
    if (replied > base) replied.setTime(base.getTime() - int(rng, 1, 30) * 60000);

    return {
      id: `REQ-2026-${pad(i + 1, 4)}`,
      employee: emp.name,
      department: emp.department,
      createdAt: fmtStamp(created),
      title: topic.title,
      content: topic.content,
      status: (answered ? "답변완료" : "답변대기") as RequestStatus,
      reply: answered ? pick(rng, REPLIES) : "",
      repliedAt: answered ? fmtStamp(replied) : "",
    };
  });

  // 최근 작성 건이 위로 오게 한다.
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
