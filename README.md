# 코코아 ERP (UiPath 실습용)

사내 ERP 느낌의 간단한 데모 사이트입니다. UiPath RPA 실습 대상으로 만들었으며, DB 없이 코드 내 고정 데이터로 동작합니다.

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, 한국어 UI
- 로그인 계정: **ID `admin` / PW `1q2w3e4r!`**

## 실행

```bash
npm install
npm run dev      # http://localhost:3300
npm run build && npm start
```

## 화면 구성

| 경로 | 설명 | 주요 실습 포인트 |
|---|---|---|
| `/login` | 로그인 | 입력/클릭, 오류 메시지 분기 |
| `/dashboard` | KPI·부서별 인원·최근 공지 + **시스템 점검 안내 모달** | 모달이 있을 때만 닫기(조건 분기) |
| `/employees` | 사원 100명, 10건씩 페이지네이션, 검색, **부서·직급·상태 필터**, **엑셀로 다운로드**, 행 클릭 시 **상세 모달** | 표 추출, 페이지 반복, 필터 선택, 파일 다운로드, 모달 입력 |
| `/customers` | 고객사 30곳, 검색, **업종·계약상태·지역 필터**, 엑셀 다운로드, 행 클릭 시 **상세 모달** | 표 추출 → Excel 저장, 필터 후 추출 |
| `/attendance` | 휴가 신청 45건 조회·승인. **신청자 검색 + 휴가유형·상태·시작일 필터**, 상세 모달에서 승인/반려 | 조건 조회 후 대기 건만 반복 처리 |
| `/overtime` | 초과 업무 승인. 최근 평일 7일치 신청 80여 건, **일자·상태·업무구분 필터**, 엑셀 다운로드, 행 클릭 시 **상세 모달에서만 승인/반려** | 날짜 입력 필터, 대기 건만 골라 반복 처리, 반려 사유 입력 |
| `/approvals` | 결재 40건, 상태 필터, 승인/반려 버튼 | 조건부 클릭, 상태 변경 |
| `/notices` | 공지 12건 + 상세. **'🚨 중요' 공지는 최상단 고정** | 목록→상세 스크래핑, 중요 공지만 추출 |

### 점검 안내 모달
- 로그인 직후 대시보드에서 표시 (`#notice-modal`)
- `#btn-hide-today` 오늘은 그만 보기 / `#btn-confirm` 확인
- '오늘은 그만 보기'는 localStorage에 저장되며 **로그아웃하면 초기화**되어 다음 로그인에 다시 뜹니다.
- '확인'은 해당 로그인 세션 동안만 닫습니다.

### 필터와 엑셀 다운로드
- 필터는 `#filter-department` `#filter-position` `#filter-status`(사원), `#filter-industry` `#filter-contract` `#filter-region`(고객사), `#filter-date`(날짜 입력) `#filter-status` `#filter-category`(초과 승인), `#filter-from`(날짜 입력) `#filter-type` `#filter-status`(휴가) 이며, `#btn-filter-reset`으로 검색어까지 초기화합니다.
- '엑셀로 다운로드'는 **현재 검색·필터 결과만** 내려받습니다(쿼리스트링으로 같은 조건을 서버에 전달). 필터를 걸지 않으면 전체가 내려갑니다.
- 다운로드 파일은 서버의 원본 데이터 기준이라, 상세 모달에서 수정한 값은 반영되지 않습니다.

### 상세 모달 (행 클릭, `#employee-modal` / `#customer-modal`)
| 구분 | 볼 수 있는 정보 | 가능한 기능 |
|---|---|---|
| 사원 | 기본정보, 근속연수, 연차 현황(총/사용/잔여), 최근 휴가 이력 3건 | 재직↔휴직 전환(`#btn-toggle-status`), 정보 수정(부서·직급·이메일·연락처, `#btn-edit`), 인사 메모 저장(`#detail-memo`) |
| 고객사 | 기본정보, 담당자, 계약기간·연 계약금·결제조건, 최근 거래 4건과 누적 거래액, 상담 메모 | 계약상태 변경(`#detail-contract-select`), 담당자 정보 수정(`#btn-edit`), 상담 메모 등록(`#note-text`, `#btn-note-add`) |

### 초과 승인 모달 (`#overtime-modal`)
- 신청 정보(일자·신청자·부서·업무구분·고객사·시간), 업무 내용, 비고를 보여줍니다.
- 승인대기 건에서만 `#btn-ot-approve`(승인) / `#btn-ot-reject`(반려)가 나타납니다. 표에서는 처리할 수 없습니다.
- **반려는 `#ot-note`에 사유를 입력해야** 가능하며, 비어 있으면 `#ot-error`에 오류가 뜹니다. 처리 결과는 `#ot-message`로 확인합니다.
- 업무구분: 고객대응·개발·본사업무·운영·마케팅·기타 / 상태: 승인대기·승인완료·반려. 고객사는 '계약중'인 등록 고객사만 들어갑니다.
- 신청 데이터는 **오늘 기준 최근 평일 7일**로 매일 다시 생성되며, 최근 2일치는 모두 승인대기입니다.

닫기: `#btn-detail-close`, 우상단 ×, ESC, 바깥 영역 클릭. 연차·거래 내역 등은 ID로 시드를 만든 가상 데이터라 항상 같은 값이 나옵니다.

### 휴가 승인 모달 (`#leave-modal`)
- 승인대기(`신청`) 건에서만 `#btn-leave-approve` / `#btn-leave-reject`가 보이고, **반려는 `#leave-note`에 사유 입력이 필수**입니다(`#leave-detail-error`). 결과는 `#leave-detail-message`.
- 신청 데이터는 **오늘 기준 과거 20일 ~ 향후 20일**로 매일 다시 생성됩니다.

### 상태가 유지되는 범위
휴가·결재·초과 승인 처리와 상세 모달에서의 수정은 브라우저 메모리에만 반영되므로 **새로고침하면 초기 상태로 돌아갑니다**.
각 화면의 **`#btn-reset-leaves` / `#btn-reset-approvals` / `#btn-reset-overtime`(처리 상태 초기화)** 버튼으로도 되돌릴 수 있습니다. 실습을 반복하기 좋게 한 설계입니다.

### 셀렉터 팁
주요 요소에 고정 `id`가 있습니다: `#username`, `#password`, `#btn-login`, `#btn-logout`, `#menu-*`, `#employee-table`, `#customer-table`, `#btn-export-excel`, `#btn-prev`, `#btn-next`, `#page-N`, `#leave-*`, `#approve-<문서번호>`, `#reject-<문서번호>` 등.
엑셀 다운로드 파일명: `cocoa_employees.xlsx`, `cocoa_customers.xlsx`, `cocoa_overtime.xlsx`.

## 추가로 해볼 만한 UiPath 실습

1. **로그인 자동화** — 정상/오류 계정 분기, 오류 메시지(`#login-error`) 읽기
2. **모달 처리** — Element Exists / Check App State로 모달이 뜬 경우에만 클릭
3. **Data Scraping + 페이지네이션** — 사원 10페이지를 반복 추출해 하나의 DataTable로 합치고 Excel 저장
4. **다운로드 파일 처리** — '엑셀로 다운로드' 클릭 → 다운로드 폴더 대기 → 이동/이름 변경 → Excel 읽기
5. **결재 자동 처리** — 금액 기준 등 규칙으로 대기 건 자동 승인/반려
6. **초과 승인 일괄 처리** — 날짜·상태 필터로 승인대기 건만 추린 뒤, 상세 모달을 열어 규칙(업무구분·시간 등)에 따라 승인하거나 사유를 적어 반려
7. **공지 스크래핑 → 메일/메신저 요약 발송**
8. **Orchestrator Queue 연계** — Dispatcher가 결재 대기건을 큐에 적재, Performer가 처리 (REFramework 간소화)
9. **데이터 검증** — 웹 표와 다운로드 엑셀의 건수/값 일치 비교(테스트 자동화)

## Vercel 배포

```bash
npx vercel          # 미리보기
npx vercel --prod   # 운영 배포
```

지역은 `vercel.json`에서 `icn1`(서울)로 지정되어 있습니다. 환경변수는 필요 없습니다.
