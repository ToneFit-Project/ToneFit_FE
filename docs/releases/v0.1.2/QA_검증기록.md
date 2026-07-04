# ToneFit v0.1.1 내부 테스트 빌드 — 회신 TOO_LONG 수정 검증

작성: 2026-07-04 (Claude QA) / 대상: dist_v0.1.1_internal (미니파이 번들 직접 패치, 소스 미반영 상태)

## 배경 (v0.1.0 버그)

회신 호출 시 즉시 "대화가 길어 정리하기 어려워요" 표출. 원인 확정(적대 검증 3에이전트 만장일치):

- content script가 `.gmail_quote` **통짜**(중첩 인용 = 스레드 전체 + attribution + 서명)를 body 1건으로 추출
- detached `cloneNode`의 `innerText`는 textContent로 동작 → Gmail이 `⋯`로 **접어둔 숨김 인용까지 길이에 포함**
- 그 위에 `s.length > 1000` 클라이언트 게이트 → API 호출 전 무조건 차단 (서버 아님, Network 요청 0건)
- `mails[]`는 배열로 설계됐으나(BE FUNC-Rep-02: 메일별 300자 요약 판정, 마지막 메일 요약 제외) 항상 1건만 전송 — 스레드 분리 로직 자체가 미구현

## v0.1.1 패치 내용

`assets/content.ts-DtcBb9kq.js` 회신 분기만 교체 (비회신 경로 무변경, diff 단일 구간):

1. **tfSplit**: 중첩 `gmail_quote`를 레벨별로 하강하며 **최근 3건** 분리 — 레벨별 sender(`.gmail_attr`) + body(하위 인용/attr/서명 제거)
2. **tfText**: 블록 인지 텍스트 추출기 — `innerText` 미사용(STYLE/SCRIPT 텍스트 제외, 줄바꿈 보존, &nbsp; 정규화)
3. **게이트 재정의**: 1000자·한국어 게이트를 **회신 대상(최신) 메일 단독**에만 적용
4. **전송 순서**: `mails` = 시간순 `[과거 → 최신]` (BE "마지막 메일 요약 제외"와 정합하도록 최신을 마지막에)
5. **uet 폴백**(인용 삭제 후 재시도 경로)에도 동일 분리 적용
6. **비표준 레벨 병합 보존**: 전달(Fwd)·모바일 Gmail·타 클라이언트 인용처럼 표준 `blockquote.gmail_quote` 직계 구조가 아닌 레벨을 만나면 그 이하 전체를 **1건으로 병합 보존** 후 하강 종료 — 본문 소실/오귀속 없이 v0.1.0 동등성 보장 (`:scope > blockquote.gmail_quote` 직계 한정)
7. **try/catch 안전망**: 추출 예외 시 조용히 죽지 않고 `REPLY_EXTRACT_ERROR`(→ generic 에러 화면)
8. 디버그 로그 활성화(`var e=!0`) — 내부 빌드 한정

오프라인 검증 (2단계, 전부 통과):
- 기본 픽스처 23/23 PASS (3중첩/5중첩/단일/style태그/서명/빈인용/attr누락/blockquote엣지/1000자게이트 시뮬)
- **적대 검증**: 3에이전트 — 스코프 충돌 0건(vm 하니스 7시나리오 실측), 비회신 경로 회귀 0건(바이트 diff 단일 구간 확인), Gmail 변형 구조 실결함 2건 발견(직계 아닌 자손 blockquote 오결합 / 폴백 레벨 본문 소실) → **수정 후 재검증**: Fwd·모바일·구형 픽스처(A1~D5)에서 본문 소실 0, 오귀속 0

## 설치

1. `chrome://extensions` → 개발자 모드 ON
2. 기존 ToneFit(스토어판) **비활성화** (버튼 중복 삽입 방지)
3. "압축해제된 확장 프로그램 로드" → `dist_v0.1.1_internal/dist` 폴더 선택
4. Gmail 탭 새로고침

## 라이브 검증 시나리오

콘솔 로그 확인 위치: Gmail 탭 DevTools Console — `[ToneFit v0.1.1] reply 분리 추출 — N건 / sender|길이자` 형식.

| # | 시나리오 | v0.1.0 결과 | v0.1.1 기대 결과 |
|---|---|---|---|
| R1 | **왕복 2회+ 한국어 스레드**(합산 1000자↑, 최신 메일은 1000자↓)에서 답장 열고 ToneFit 클릭 | 즉시 TOO_LONG ❌ | 요약/파악 로딩 진입, 콘솔에 2~3건 분리 로그 ✅ |
| R2 | R1에서 **Network 탭**: `/replies/summary`·`/replies/analysis` 요청 발생 + payload의 `mails` 배열 확인 | 요청 0건 | 2~3건, `[과거→최신]` 순 |
| R3 | R2 응답의 summaries가 **마지막(최신) 메일을 요약에서 제외**하는지 → **순서 계약 검증** (제외 대상이 반대면 reverse 제거 필요, 아래 '순서 계약' 참조) | — | 최신 제외 |
| R4 | 첫 답장(단일 인용, 짧은 메일) | 케이스별 통과/차단 | 1건 전송, 정상 진입 |
| R5 | **최신 메일 자체가 1000자 초과**인 스레드 | TOO_LONG | TOO_LONG (의도된 스펙 유지) ✅ |
| R6 | 인용문 삭제 후 재시도(제목 Re: 유지 → uet 폴백 경로) | 통짜 재추출로 TOO_LONG 재발 | 분리 추출로 정상 진입 |
| R7 | 영어 메일에 답장 | NON_KOREAN | NON_KOREAN 유지 (최신 메일 기준 판정) |
| R8 | 스레드 5회+ 왕복 | TOO_LONG | 최근 3건만 전송 |
| R9 | 회신 초안 생성 완료까지 E2E — 초안 품질이 **최신 메일 입장에 대한 회신**인지 (과거 메일에 답하면 순서 계약 문제) | 도달 불가 | 정상 초안 |
| G1 | (회귀) 새 메일 작성 → 생성 모드 정상 | 정상 | 정상 (해당 경로 무변경) |
| G2 | (회귀) 40자 이상 작성 후 교정 모드 정상 | 정상 | 정상 (해당 경로 무변경) |

## 순서 계약 (✅ 확정 — API 명세서 v0.57, 2026-07-04 확인)

`~/Downloads/2팀_ToneFit_API 명세서.pdf` p.17 (성민우, 6/12):
> "mails는 **시간순(오래된 → 최신), 마지막 요소가 사용자가 '답장'을 누른 메일**(격식 판단 기준, FUNC Rep-05). 최근 3건까지 — 인용으로 따라붙은 건 건수로 세지 않는다."

→ v0.1.1의 `reverse()`(시간순 전송)가 스펙과 일치. **R3는 결정이 아니라 구현 확인 항목으로 강등.**

같은 명세에서 추가 확정된 계약:
- **길이**: 요청 필드 `body` 최대 **10,000자/건**(임시값), 서버는 정리 후 합산 **20,000자 초과 → 400 CONTENT_TOO_LONG** (차감 전 검증). → v0.1.1 게이트를 1,000 → **10,000자/건**으로 정렬 (2026-07-04 재빌드 반영)
- **가공 정책 차이(스펙 편차)**: 스펙은 "블록 단위 raw 텍스트, 가공 없이(인용 trail 포함), 중복 인용·서명 제거는 서버 수행(FUNC Rep-04)". v0.1.1은 클린 분리 전송 — 기능상 무해(서버 dedup no-op)하나 서버의 'trail로 이전 대화 복원'은 미활용. **소스 반영 시 FE·BE 협의 항목** (서버 정리 신뢰 시 FE는 경계 분리만 하고 trail 유지가 스펙 정본)
- **게이트 순서**: 킬스위치(503 REPLY_SUSPENDED) → MAIL_READ 동의(400 TERMS_AGREEMENT_REQUIRED) → 길이/빈대화(차감 전) → 일일 100 합산 + **분당 3회**(429) — 라이브 테스트 시 분당 3회 주의
- NOT_KOREAN은 **파악 전용**(모델 판정) — 요약은 반환 안 함

- 직접 curl 검증은 BLOCKED: `/replies/*` 401 (정상 — #80과 달리 인증 적용됨), `/auth/anonymous`는 여전히 SPA 폴백(HTML 200)이라 헤드리스 토큰 발급 불가. 필요 시 패널 로그인 후 `chrome.storage.local`의 `tonefit_access_token`으로 curl 재현 가능.

## 알려진 한계 (v0.1.1 범위 밖, 소스 반영 시 FE에 전달)

- 타 클라이언트(Outlook/Naver 등)·전달(Fwd)·모바일 인용이 스레드 중간에 끼면 그 이하는 병합 1건으로 전송 → 3건 미만이 될 수 있음 (내용 소실은 없음, v0.1.0 동등)
- 최신 메일 자체가 Outlook발이면 m[0]에 헤더/이전 본문이 혼입될 수 있음 (v0.1.0 blob과 동일 내용 — 후퇴 아님). 이 경우 1000자 게이트에 걸릴 수 있음
- 짧은 영어 자동응답이 한국어 스레드 위에 얹힌 경우 NON_KOREAN으로 차단됨 — 최신 메일 기준 판정은 파악 프롬프트 스펙("마지막 메일 중심")과 정합이나, 정책 확인 필요
- `p()`/subjectbox 문서 전역 폴백: compose 창 2개 이상 열면 다른 창을 측정할 수 있는 기존 버그 유지 (이번 패치 범위 아님)
- 이 빌드는 **번들 직접 패치**임 — 오경민님 소스(content.ts)에 동일 로직 반영 후 정식 빌드로 대체해야 함

## BE 연동 실테스트 (✅ 2026-07-04, 로컬 구동)

레포: `ToneFit_BE`(github.com/ToneFit-Project) 클론 → `~/Desktop/ToneFit/ToneFit_BE`. JDK 21 + PostgreSQL 16을 `~/Desktop/ToneFit/.localdev/`에 유저 레벨 설치, local 프로파일(마이그레이션 22개) + dev JWT 시크릿으로 토큰 발급, stub → 실 Gemini 순으로 검증.

**계약 테스트 (stub AI) 27/27 PASS** — `.localdev/contract_test.py`:
- **T1** v0.1.1 클린 3건 시간순: summary order 1→3 부여·순서 보존, analysis conversation `[1][2][3]` 조립, [3]=최신 ✓
- **T2** 스펙 정본(raw trail 포함): MailCleaner 중복 제거 + 미중복 trail `[이전 대화 — 복원]` 라벨 ✓ → **클린/raw 양쪽 모두 서버가 정상 처리** (FE 가공 정책은 어느 쪽이든 호환)
- **T3** v0.1.1 병합 tail(비표준 인용 폴백): 서버가 마커 기준 own/trail 분리, 하위 메일을 복원 블록으로 이동 ✓ — 병합 보존 설계가 서버 정리와 맞물림
- **T4** 게이트: 4건→400 / 10,001자/건→400 / 클린 후 합산 27,000자→CONTENT_TOO_LONG / 서명만→EMPTY_THREAD ✓
- **T5** MAIL_READ 미동의→TERMS_AGREEMENT_REQUIRED + missing_terms ✓
- **T6** 작성: 201 {generated_subject "Re:"·generated_email} / 없는 question_id→400 ✓
- 참고: 분당 한도 로컬 기본 20회(prod는 env `USER_REPLY_LIMIT_PER_MINUTE`, 명세상 3회). 킬스위치는 `REPLY_ENABLED` env — 코드 확인만(재기동 필요해 미실측)

**실 Gemini E2E PASS** — `.localdev/gemini_test.py`:
- 요약 5.6s: 메일별 요약 order 1~3 (마지막 메일 포함 — 요약은 표시 전용이라 제외 없음이 맞음)
- 파악 5.2s: recipient **CLIENT/high** (도메인+맥락 근거), 질문 3개 전부 **mail_order=3(최신 메일)** — 질문이 답장 대상 메일에서 추출됨 ✓
- 작성 13.1s: **"이수진 담당자님"(마지막 원소 발신자) 수신 초안** + 답변 3건 전부 반영 + "QA테스터 올림"(BE가 nickname 주입) → **순서 계약이 실 AI 끝까지 관통 실증**
- NOT_KOREAN: 영어 스레드 → 400 NOT_KOREAN (모델 판정) ✓

**재기동 방법**: `.localdev/pg16/bin/pg_ctl -D ~/Desktop/ToneFit/.localdev/pgdata start` → `cd ToneFit_BE && AI_PROVIDER=stub .localdev JDK로 java -jar build/libs/tonefit-server-*.jar --spring.profiles.active=local` (실 AI는 `AI_PROVIDER=gemini GEMINI_API_KEY=...`). 토큰: `python3 .localdev/forge_token.py 1`

**남은 것**: 크롬에서 v0.1.1 언팩 로드 후 실제 Gmail 스레드 E2E (아래 R1~R9 — 익스텐션이 프로덕션 `tonefit.kr`을 바라보므로 프로덕션 배포본 기준. R3 순서·게이트는 이미 코드+로컬 실측으로 확정라 UI 흐름 확인이 본질)

## 결과 기록

| # | 결과 | 비고 |
|---|---|---|
| R1 | | |
| R2 | | |
| R3 | | |
| R4 | | |
| R5 | | |
| R6 | | |
| R7 | | |
| R8 | | |
| R9 | | |
| G1 | | |
| G2 | | |
