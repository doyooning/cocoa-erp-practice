import { createRng, fmtDate, int, pad, phone, pick } from "../random";

export type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  status: "재직" | "휴직";
};

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍"];
const GIVEN = ["민준", "서연", "지호", "하윤", "도윤", "서준", "지우", "예준", "수빈", "지민", "현우", "유진", "건우", "나연", "시우", "채원", "승현", "다은", "태양", "소율", "재현", "지은", "동현", "하린", "성민", "유나", "준서", "아린", "민재", "세아"];
const ROMAN: Record<string, string> = { 김: "kim", 이: "lee", 박: "park", 최: "choi", 정: "jung", 강: "kang", 조: "jo", 윤: "yoon", 장: "jang", 임: "lim", 한: "han", 오: "oh", 서: "seo", 신: "shin", 권: "kwon", 황: "hwang", 안: "ahn", 송: "song", 류: "ryu", 홍: "hong" };
const GIVEN_ROMAN: Record<string, string> = { 민준: "minjun", 서연: "seoyeon", 지호: "jiho", 하윤: "hayun", 도윤: "doyun", 서준: "seojun", 지우: "jiwoo", 예준: "yejun", 수빈: "subin", 지민: "jimin", 현우: "hyunwoo", 유진: "yujin", 건우: "gunwoo", 나연: "nayeon", 시우: "siwoo", 채원: "chaewon", 승현: "seunghyun", 다은: "daeun", 태양: "taeyang", 소율: "soyul", 재현: "jaehyun", 지은: "jieun", 동현: "donghyun", 하린: "harin", 성민: "sungmin", 유나: "yuna", 준서: "junseo", 아린: "arin", 민재: "minjae", 세아: "sea" };

export const DEPARTMENTS = ["경영지원팀", "인사팀", "재무팀", "영업1팀", "영업2팀", "마케팅팀", "개발팀", "품질관리팀", "구매팀", "고객지원팀"];
export const POSITIONS = ["사원", "주임", "대리", "과장", "차장", "부장"];

function build(): Employee[] {
  const rng = createRng(20260101);
  const used = new Set<string>();
  const list: Employee[] = [];
  for (let i = 0; i < 100; i++) {
    let name: string;
    do {
      name = pick(rng, SURNAMES) + pick(rng, GIVEN);
    } while (used.has(name));
    used.add(name);
    const hire = new Date(2010 + int(rng, 0, 15), int(rng, 0, 11), int(rng, 1, 28));
    const roman = `${ROMAN[name[0]]}.${GIVEN_ROMAN[name.slice(1)]}`;
    list.push({
      id: `EMP${pad(i + 1, 4)}`,
      name,
      department: pick(rng, DEPARTMENTS),
      position: pick(rng, POSITIONS),
      email: `${roman}@cocoa.co.kr`,
      phone: phone(rng),
      hireDate: fmtDate(hire),
      status: rng() < 0.06 ? "휴직" : "재직",
    });
  }
  return list;
}

export const employees: Employee[] = build();
