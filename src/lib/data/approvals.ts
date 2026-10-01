import { createRng, fmtDate, int, pad, pick } from "../random";
import { employees } from "./employees";

export type ApprovalStatus = "대기" | "승인" | "반려";

export type Approval = {
  id: string;
  title: string;
  drafter: string;
  draftDate: string;
  amount: number;
  status: ApprovalStatus;
};

const TITLES = ["출장 신청서", "비품 구매 요청", "교육비 지원 신청", "법인카드 사용 내역 정산", "외주 용역 계약 품의", "야근 식대 청구", "노트북 교체 요청", "행사 예산 승인 요청", "소프트웨어 라이선스 갱신", "거래처 접대비 신청"];

function build(): Approval[] {
  const rng = createRng(20260303);
  const list: Approval[] = [];
  for (let i = 0; i < 40; i++) {
    const r = rng();
    list.push({
      id: `APR-2026-${pad(i + 1, 4)}`,
      title: pick(rng, TITLES),
      drafter: pick(rng, employees).name,
      draftDate: fmtDate(new Date(2026, 8, int(rng, 1, 30))),
      amount: int(rng, 3, 300) * 10000,
      status: r < 0.45 ? "대기" : r < 0.8 ? "승인" : "반려",
    });
  }
  return list;
}

export const initialApprovals: Approval[] = build();
