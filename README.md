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
| `/employees` | 사원 100명, 10건씩 페이지네이션, 검색, **엑셀로 다운로드** | 표 추출, 페이지 반복, 파일 다운로드 |
| `/customers` | 고객사 30곳, 동일 기능 | 표 추출 → Excel 저장 |
| `/attendance` | 휴가 신청 폼 + 내역 표 | 폼 입력(select/date/text) 반복 |
| `/approvals` | 결재 40건, 상태 필터, 승인/반려 버튼 | 조건부 클릭, 상태 변경 |
| `/notices` | 공지 12건 + 상세 | 목록→상세 스크래핑 |

### 점검 안내 모달
- 로그인 직후 대시보드에서 표시 (`#notice-modal`)
- `#btn-hide-today` 오늘은 그만 보기 / `#btn-confirm` 확인
- '오늘은 그만 보기'는 localStorage에 저장되며 **로그아웃하면 초기화**되어 다음 로그인에 다시 뜹니다.
- '확인'은 해당 로그인 세션 동안만 닫습니다.

### 상태가 유지되는 범위
휴가 신청·결재 승인/반려는 브라우저 메모리에만 반영되므로 **새로고침하면 초기 상태로 돌아갑니다**. 실습을 반복하기 좋게 한 설계입니다.

### 셀렉터 팁
주요 요소에 고정 `id`가 있습니다: `#username`, `#password`, `#btn-login`, `#btn-logout`, `#menu-*`, `#employee-table`, `#customer-table`, `#btn-export-excel`, `#btn-prev`, `#btn-next`, `#page-N`, `#leave-*`, `#approve-<문서번호>`, `#reject-<문서번호>` 등.
엑셀 다운로드 파일명: `cocoa_employees.xlsx`, `cocoa_customers.xlsx`.

## 추가로 해볼 만한 UiPath 실습

1. **로그인 자동화** — 정상/오류 계정 분기, 오류 메시지(`#login-error`) 읽기
2. **모달 처리** — Element Exists / Check App State로 모달이 뜬 경우에만 클릭
3. **Data Scraping + 페이지네이션** — 사원 10페이지를 반복 추출해 하나의 DataTable로 합치고 Excel 저장
4. **다운로드 파일 처리** — '엑셀로 다운로드' 클릭 → 다운로드 폴더 대기 → 이동/이름 변경 → Excel 읽기
5. **엑셀 → 웹 입력** — Excel 행을 For Each Row로 읽어 휴가 신청 폼 일괄 입력
6. **결재 자동 처리** — 금액 기준 등 규칙으로 대기 건 자동 승인/반려
7. **공지 스크래핑 → 메일/메신저 요약 발송**
8. **Orchestrator Queue 연계** — Dispatcher가 결재 대기건을 큐에 적재, Performer가 처리 (REFramework 간소화)
9. **데이터 검증** — 웹 표와 다운로드 엑셀의 건수/값 일치 비교(테스트 자동화)

## Vercel 배포

```bash
npx vercel          # 미리보기
npx vercel --prod   # 운영 배포
```

지역은 `vercel.json`에서 `icn1`(서울)로 지정되어 있습니다. 환경변수는 필요 없습니다.
