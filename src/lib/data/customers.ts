import { createRng, int, pad, phone, pick } from "../random";

export type Customer = {
  id: string;
  name: string;
  ceo: string;
  industry: string;
  manager: string;
  phone: string;
  email: string;
  address: string;
  contract: "계약중" | "협의중" | "종료";
};

const NAMES = ["한빛전자", "대성물산", "누리소프트", "보람식품", "새론건설", "미래모빌리티", "청솔제약", "하나로지스", "동원테크", "유성화학", "푸른유통", "다온시스템", "세진철강", "아이온바이오", "태화패션", "리얼푸드", "코리아패키징", "솔빛에너지", "한결인쇄", "바른금융", "스카이항공서비스", "그린팜", "우주통신", "금강기계", "예담출판", "나래호텔", "한울반도체", "오로라디스플레이", "이든교육", "비전엔지니어링"];
const DOMAINS = ["hanbit", "daesung", "nuri", "boram", "saeron", "mirae", "chungsol", "hanalogis", "dongwon", "yusung", "purun", "daon", "sejin", "aion", "taehwa", "realfood", "kpack", "solbit", "hangyeol", "barun", "skyair", "greenfarm", "ujoo", "geumgang", "yedam", "narae", "hanul", "aurora", "eden", "vision"];
const SUFFIX = ["(주)", "(주)", "(주)", "(유)"];
const CEO = ["김철수", "이영희", "박정훈", "최민석", "정수진", "강태웅", "조은혜", "윤상호", "장미란", "임도현", "한지원", "오세훈", "서나래", "신동욱", "권혁진"];
const MANAGER = ["민서준", "김하은", "이도현", "박서윤", "최지안", "정우진", "강예린", "조현수", "윤가은", "장시윤"];
const INDUSTRY = ["전자부품", "식품", "건설", "물류", "제약", "화학", "금융", "IT서비스", "유통", "제조", "에너지", "교육"];
const CITY = ["서울특별시 강남구 테헤란로", "서울특별시 마포구 월드컵북로", "경기도 성남시 분당구 판교로", "경기도 수원시 영통구 광교로", "인천광역시 연수구 송도과학로", "부산광역시 해운대구 센텀중앙로", "대전광역시 유성구 대학로", "대구광역시 수성구 달구벌대로", "광주광역시 북구 첨단과기로", "울산광역시 남구 삼산로"];
const CONTRACT: Customer["contract"][] = ["계약중", "계약중", "계약중", "협의중", "종료"];

function build(): Customer[] {
  const rng = createRng(20260202);
  return NAMES.slice(0, 30).map((n, i) => ({
    id: `CUS${pad(i + 1, 3)}`,
    name: `${n}${pick(rng, SUFFIX)}`,
    ceo: pick(rng, CEO),
    industry: pick(rng, INDUSTRY),
    manager: pick(rng, MANAGER),
    phone: phone(rng),
    email: `contact${pad(i + 1, 3)}@${DOMAINS[i]}.com`,
    address: `${pick(rng, CITY)} ${int(rng, 1, 300)}`,
    contract: pick(rng, CONTRACT),
  }));
}

export const customers: Customer[] = build();
